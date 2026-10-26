# FMUCD Process Analysis

This is an ongoing project using the **Facility Management Unified Classification Database (FMUCD)** for a series of manufacturing- and process-related analyses. FMUCD contains public university maintenance records. It provides a practical setting for studying work descriptions, uneven task histories, process families, and estimates of work-order completion time.

The project will grow through a series of Jupyter notebooks. The first notebook explores the data and prepares inputs for later clustering and predictive modeling.

## Current work

[`data_exp.ipynb`](data_exp.ipynb) examines:

- Missing values, duplicate records, and work-order identifiers.
- Recorded duration and agreement with start/end dates.
- Differences across universities, states/provinces, maintenance types, and priorities.
- Building characteristics and existing system/component classifications.
- Work-description quality, repetition, and duration variability.
- Time patterns and chronological training, validation, and test splits.

The notebook also creates description-only text, descriptions combined with classification context, and training-task aggregate features. Text, clustering features, and duration outcomes are saved separately.

## Notebook sequence

| Notebook | Purpose | Status |
| --- | --- | --- |
| [`data_exp.ipynb`](data_exp.ipynb) | Explore, audit, and export task/work-order datasets. | Exploratory analysis |
| [`embedding.ipynb`](embedding.ipynb) | Compare work-description and context-enhanced text vectors. | Pilot run completed |
| [`clustering.ipynb`](clustering.ipynb) | Compare text, aggregate, and combined task families. | Pilot run completed |
| [`modeling.ipynb`](modeling.ipynb) | Compare duration baselines and models with/without family labels. | Validation pilot completed; final test pending |

Run the notebooks in this order. Review the `RUN_*` switches before execution and use matching upstream run names. Saved notebook outputs document the pilot runs. Choose a new run name for each experiment; overwriting requires an explicit switch. Generated artifacts go under `data/embeddings/`, `data/families/`, and `data/modeling/` and remain outside Git.

The default embedding backend is a local TF-IDF/SVD baseline. For pretrained semantic embeddings, install `requirements-embeddings.txt` and select the sentence-transformer backend. Model downloads require an explicit configuration change. Duration models initially use bounded samples; the manifests record sample sizes. Optional ANN fitting and final test evaluation require separate switches.

The drafts fit transformations and clusters using training tasks only and verify upstream artifact fingerprints. Aggregate profiles are unavailable for unseen tasks, which remain unassigned for aggregate-based families. Modeling reports that coverage alongside known/unseen-task errors. Test outcomes are opened only after an explicit candidate is locked.

The notebooks use short code cells, direct tables/plots, and brief purpose/result notes. For the ten-minute presentation, the main story is the duration distribution, sparse descriptions, a few representative families, and the model comparison. The remaining checks support those choices and can be kept as backup material.

## Planned analyses

- Compare text embeddings with and without system, subsystem, and component descriptions.
- Discover task families using text, aggregate features, and combinations of the two.
- Assess cluster stability and interpretability.
- Compare duration estimates against simple historical and classification-based baselines.
- Examine performance for common, rare, and previously unseen work types.
- Extend the analysis to other manufacturing and process questions supported by the data.

The pilot covers embeddings, clustering, and validation modeling. Further comparisons and final test evaluation remain open. The current target, `WODuration`, measures **elapsed days**, including potential waiting and administrative delays. It does not measure hands-on labor time.

## Getting started

Use Python 3.11 or later in a virtual environment:

```bash
python -m venv .venv
# Activate .venv using the command for your operating system.
python -m pip install -r requirements.txt
jupyter lab
```

Download the CSV from the [FMUCD dataset page](https://data.mendeley.com/datasets/cb8d2nsjss/1), save it as `data/FMUCD.csv`, and run `data_exp.ipynb` from top to bottom. The notebook reads the full dataset and may require several GB of memory.

```text
fmucd_analysis/
├── README.md
├── requirements.txt
├── data_exp.ipynb
├── embedding.ipynb
├── clustering.ipynb
├── modeling.ipynb
├── pipeline_utils.py
└── data/
    ├── README.md
    ├── FMUCD.csv            # Download separately; not versioned
    └── clustering/          # Generated tables, audit, and manifest; not versioned
```

Raw data, generated datasets, notebook checkpoints, and local environments are excluded from Git. The notebook contains saved exploratory outputs; rerun it to regenerate the feature tables and their dataset guide.

## Modeling considerations

Missing durations, repeated order IDs, sparse descriptions, and differences in university practices affect the analysis. Exclusions are recorded in the generated audit table. Historical features and learned transformations must use training data only. Building-condition assessments, realized costs, and completion dates require particular care when defining what is available at prediction time.

## Data source and attribution

Pampana, Ashish Kumar; Jeon, JungHo; Yoon, Soojin; Weidner, Theodore (2024). *Facility Management Unified Classification Database (FMUCD)*. Mendeley Data, V1. [doi:10.17632/cb8d2nsjss.1](https://doi.org/10.17632/cb8d2nsjss.1).

The source dataset is licensed under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). This project cleans and derives features from that dataset. See the [accompanying paper](https://doi.org/10.1016/j.dib.2024.110845) for its original collection methods and field definitions.

## Pilot results and current changes

The [analysis report](reports/fmucd_analysis_report.md) summarizes the completed runs. The best validation candidate was full-feature Extra Trees (RMSE 24.94 elapsed days). Adding text-family labels reduced MSE by approximately 0.4% relative to the same model without family labels. This is a small validation gain, with no completed final-test result.

The completed embedding run used TF-IDF/SVD. The latest exploration code removes added field labels from concatenated text while retaining the original work, system, subsystem, and component descriptions. That text change has not been rerun through the pipeline, so the saved results and report describe the previous labeled-text run.

The [ten-minute interview deck](presentations/fmucd_results_draft.pptx) and [speaker notes](presentations/speaker_notes.md) summarize the pilot results.
