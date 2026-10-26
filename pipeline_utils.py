"""Small file and alignment helpers shared by the review notebooks."""
import hashlib
import json
import os
from pathlib import Path


def project_root():
    if os.environ.get('FMUCD_PROJECT_DIR'):
        return Path(os.environ['FMUCD_PROJECT_DIR']).resolve()
    for path in [Path.cwd(), Path.cwd() / 'fmucd_analysis']:
        if (path / 'data/clustering/manifest.json').exists():
            return path.resolve()
    raise FileNotFoundError('Open the notebook from fmucd_analysis and run data_exp.ipynb first.')


def read_json(path):
    return json.loads(Path(path).read_text(encoding='utf-8'))


def write_json(path, data):
    Path(path).write_text(json.dumps(data, indent=2, allow_nan=False), encoding='utf-8')


def fingerprint(paths):
    result = {}
    for path in map(Path, paths):
        digest = hashlib.sha256()
        with path.open('rb') as stream:
            for block in iter(lambda: stream.read(4 * 1024 * 1024), b''):
                digest.update(block)
        result[path.name] = digest.hexdigest()
    return result


def assert_fingerprints(directory, expected):
    actual = fingerprint(Path(directory) / name for name in expected)
    if actual != expected:
        raise ValueError('Upstream files changed. Regenerate this stage before continuing.')


def require_new_run(directory, overwrite=False):
    directory = Path(directory)
    if directory.exists() and any(directory.iterdir()) and not overwrite:
        raise FileExistsError(f'{directory} already contains files. Choose a new RUN_NAME or explicitly enable OVERWRITE.')
    directory.mkdir(parents=True, exist_ok=True)
    # A manifest marks successful completion. Remove an old one before an explicit rerun.
    manifest = directory / 'manifest.json'
    if manifest.exists():
        manifest.unlink()
    return directory


def safe_run_name(value):
    if not value or any(c not in 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_-' for c in value):
        raise ValueError('RUN_NAME must contain only letters, digits, underscores, or hyphens.')
    return value


def write_vector_batches(path, texts, transform, dimensions, batch_size):
    """Write and close a temporary matrix before replacing the destination."""
    import tempfile
    import numpy as np
    path = Path(path)
    path.parent.mkdir(parents=True, exist_ok=True)
    if len(texts) == 0 or dimensions < 1 or batch_size < 1:
        raise ValueError('Text count, dimensions, and batch size must be positive.')
    with tempfile.NamedTemporaryFile(dir=path.parent, prefix=path.stem + '_',
                                     suffix='.tmp.npy', delete=False) as temporary:
        temporary_path = Path(temporary.name)
    try:
        vectors = np.lib.format.open_memmap(temporary_path, mode='w+', dtype='float32',
                                           shape=(len(texts), dimensions))
        zero_rows = 0
        try:
            for start in range(0, len(texts), batch_size):
                batch_texts = texts.iloc[start:start+batch_size].tolist()
                batch = np.asarray(transform(batch_texts), dtype=np.float32)
                if batch.shape != (len(batch_texts), dimensions) or not np.isfinite(batch).all():
                    raise ValueError('Embedding batch has an invalid shape or nonfinite values.')
                zero_rows += int((np.linalg.norm(batch, axis=1) < 1e-8).sum())
                vectors[start:start+len(batch)] = batch
            vectors.flush()
        finally:
            vectors._mmap.close()
        try:
            os.replace(temporary_path, path)
        except OSError as error:
            raise OSError(error.errno,
                'Cannot replace the embedding file. Close or restart notebook kernels that loaded '
                'it with mmap_mode, or choose a new RUN_NAME. The existing file was not truncated.',
                str(path)) from error
    finally:
        temporary_path.unlink(missing_ok=True)
    return {'file': path.name, 'dimensions': int(dimensions),
            'rows': len(texts), 'zero_vector_rows': zero_rows}


def save_exploration_exports(directory, tables, manifest, summaries, readme):
    """Save exploration outputs and verify their persisted join keys."""
    import pandas as pd
    directory = Path(directory)
    for filename, table in tables.items():
        path = directory / filename
        table.to_parquet(path, index=False, engine='pyarrow', compression='snappy')
        key = 'record_id' if 'record_id' in table else 'task_id'
        saved_keys = pd.read_parquet(path, columns=[key])[key]
        if not saved_keys.equals(table[key].reset_index(drop=True)):
            raise ValueError(f'Exported keys do not match: {filename}')
        manifest['files'][filename] = {'rows': len(table), 'columns': list(table.columns),
                                       'bytes': path.stat().st_size}
    for name, table in summaries.items():
        table.to_csv(directory / name)
    write_json(directory / 'manifest.json', manifest)
    (directory / 'README.md').write_text(readme, encoding='utf-8')
    return pd.DataFrame(manifest['files']).T[['rows', 'bytes']]


def exploration_readme(TRAIN_CUTOFF, TEST_CUTOFF):
    return f"""# FMUCD clustering inputs

    Generated by data_exp.ipynb. Source: https://data.mendeley.com/datasets/cb8d2nsjss/1 (CC BY 4.0).

    - tasks_text_wo_train.parquet: description-only embedding input, one row per training task.
    - tasks_text_context_train.parquet: description plus system/subsystem/component embedding input.
    - tasks_aggregates_train.parquet: numerical clustering features; join text on task_id.
    - task_lookup_train.parquet: text and classification lookup.
    - task_outcomes_train.parquet: duration summaries for interpretation only; exclude from clustering/predictors.
    - work_order_features.parquet: record-level context/text with train/validation/test labels.
    - work_order_outcomes.parquet: WODuration and completion date; join on record_id.
    - record_audit.parquet: retained/excluded row flags after exact deduplication.
    - manifest.json: columns, counts, split boundaries, feature lists, and limitations.

    Train outcomes must be known before {TRAIN_CUTOFF.date()}; test starts {TEST_CUTOFF.date()}.
    Training-window aggregates are discovery profiles, not per-order lagged predictors. Rebuild inside earlier folds.
    Use both known-task and unseen-task evaluations. Standardize numeric columns using training tasks only.
    Do not treat missing aggregates as zero. Do not infer equipment identity from component classification codes.
    Descriptions may have been updated after work; original creation-time text is not verified.
    No models, embeddings, or cluster labels are included.
    """.replace('\n    ', '\n')
