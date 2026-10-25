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

## Planned analyses

- Compare text embeddings with and without system, subsystem, and component descriptions.
- Discover task families using text, aggregate features, and combinations of the two.
- Assess cluster stability and interpretability.
- Compare duration estimates against simple historical and classification-based baselines.
- Examine performance for common, rare, and previously unseen work types.
- Extend the analysis to other manufacturing and process questions supported by the data.

These are research directions, not completed results. The current target, `WODuration`, measures **elapsed days**, including potential waiting and administrative delays. It does not measure hands-on labor time.

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
