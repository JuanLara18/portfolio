---
title: "Experiment Tracking in MLOps: Never Lose a Good Run Again"
date: "2026-03-25"
excerpt: "Every ML engineer has had the same nightmare: a model that performed brilliantly last week, and no record of how to reproduce it. Experiment tracking is the discipline that makes that nightmare impossible. This is the complete guide—from what needs to be tracked and why, to deep dives into MLflow, Weights & Biases, Trackio, Neptune, and DVC, with production-grade patterns for teams that need to move fast without losing their work."
tags: ["MLOps", "Experiment Tracking", "MLflow", "Weights & Biases", "DVC", "Machine Learning", "Reproducibility", "Production ML"]
headerImage: "/blog/headers/experiment-tracking-header.jpg"
readingTimeMinutes: 28
slug: experiment-tracking-mlops
estimatedWordCount: 7000
---

# Experiment Tracking in MLOps: Never Lose a Good Run Again

## The Archaeology Problem

Picture the scene. You are three weeks into a project, and the model is not converging. You dig through your notes, your notebooks, your Slack messages—looking for the run from last Tuesday that hit 0.91 F1. You remember it clearly. The loss curve looked beautiful. You took a screenshot.

The screenshot is gone. The notebook has been overwritten. The model checkpoint is in a folder called `models_v3_final_use_this/` alongside nine other folders with equally confusing names. The `requirements.txt` you used that day has since been updated. You are not trying to reproduce science—you are doing archaeology.

This is not a failure of discipline. It is the inevitable result of the way ML development actually works: rapid, iterative, exploratory. You run dozens of experiments in a week. You adjust learning rates, swap architectures, change data augmentation strategies, try different loss functions. Most of them fail. A few succeed. The ones that succeed contain information—about what your data responds to, about what architectures generalize, about what hyperparameter ranges are worth exploring. If you cannot retrieve that information, you cannot learn from your own work.

Experiment tracking is the infrastructure that makes every run retrievable. Not just the metrics—the complete context: which version of the code produced those numbers, with which hyperparameters, on which data, in which environment. The goal is not record-keeping. The goal is reproducibility, comparability, and institutional memory—the ability to turn your experimental history into a navigable body of knowledge rather than a pile of artifacts you vaguely remember creating.

This post covers the full landscape: what experiment tracking actually means at a technical level, and a deep dive into five tools—MLflow, Weights & Biases, Trackio, Neptune, and DVC—with the patterns you need to use them effectively in production.

## What an Experiment Actually Is

Before reaching for a tool, it is worth being precise about what we are tracking.

An **experiment** is a named group of related runs. "Comparing transformer architectures for text classification" is an experiment. "Hyperparameter sweep for learning rate" is an experiment. An experiment is the question you are trying to answer.

A **run** is a single execution within an experiment. Each run has a specific configuration and produces specific results. Runs are the atomic units of tracking.

Within each run, there are four categories of information that matter:

**Parameters** are the inputs you control—the decisions you make before training starts. Learning rate, batch size, model architecture, number of layers, dropout rate, regularization strength, data split ratio, random seed. Parameters are constants during a run; they are what distinguishes one run from another.

**Metrics** are the outputs you measure—the numbers that emerge from training. Loss, accuracy, precision, recall, F1 score, AUC, inference latency, memory usage, training time. Metrics can be scalar (a single number at the end of training) or time-series (a value logged at every epoch or every step).

**Artifacts** are the files produced by or consumed during a run. Trained model weights, tokenizer files, confusion matrices, ROC curves, dataset samples, preprocessing pipelines. Artifacts connect metrics to the actual objects that produced them.

**Environment** is the context in which the run executed. Python version, library versions, hardware configuration (GPU model, RAM), operating system, and—critically—the exact commit hash of the code. Without environment information, two runs with identical parameters might produce different results, and you will have no idea why.

A complete tracking record contains all four. A tracking record that only captures metrics is a leaderboard. A tracking record that captures parameters, metrics, artifacts, and environment is a reproducible scientific record.

## MLflow: The Open-Source Standard

MLflow is the most widely adopted open-source experiment tracking platform. It was built by Databricks and is now maintained by the Linux Foundation MLOps community. Its architecture reflects a deliberate design decision: rather than being a managed service that requires trusting a third party with your data, it is a self-hosted platform you control completely.

### Architecture

MLflow has three core components that are worth understanding before writing a single line of tracking code:

**The Tracking Server** stores experiment and run metadata: parameters, metrics, tags, and run status. By default, this is stored in the local filesystem as a series of files and directories. In production, it points to a relational database (PostgreSQL or MySQL).

**The Artifact Store** stores the files associated with runs—model weights, plots, datasets. By default, this is the local filesystem. In production, it is an object store: S3, GCS, or Azure Blob Storage.

**The Model Registry** is a centralized catalog of model versions with lifecycle management—staging, production, archival. It sits on top of the tracking server and provides a structured workflow for promoting models from experiments to production.

```mermaid
flowchart LR
    subgraph Client["Your Training Code"]
        direction TB
        CODE["Python Script"] --> LOG["mlflow.log_param / log_metric / log_artifact"]
    end

    subgraph Server["MLflow Tracking Server"]
        direction TB
        API["REST API"] --> DB["PostgreSQL\n(runs, params, metrics)"]
        API --> STORE["S3 / GCS\n(artifacts)"]
        DB --> REGISTRY["Model Registry"]
    end

    subgraph UI["MLflow UI"]
        DASHBOARD["Experiment Dashboard"]
        COMPARE["Run Comparison"]
        REGVIEW["Registry View"]
    end

    LOG --> API
    DB --> DASHBOARD
    DB --> COMPARE
    REGISTRY --> REGVIEW
```

### Setup

The simplest setup—tracking to local files—requires no configuration:

```bash
pip install mlflow
mlflow ui  # starts the UI at http://localhost:5000
```

For a production setup with a shared backend, use Docker Compose:

```yaml
# docker-compose.yml
version: "3.8"

services:
  postgres:
    image: postgres:16
    environment:
      POSTGRES_DB: mlflow
      POSTGRES_USER: mlflow
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
    volumes:
      - pgdata:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U mlflow"]
      interval: 10s
      timeout: 5s
      retries: 5

  mlflow:
    image: ghcr.io/mlflow/mlflow:v2.12.1
    ports:
      - "5000:5000"
    environment:
      MLFLOW_BACKEND_STORE_URI: postgresql://mlflow:${POSTGRES_PASSWORD}@postgres:5432/mlflow
      MLFLOW_DEFAULT_ARTIFACT_ROOT: s3://${S3_BUCKET}/mlflow-artifacts
      AWS_ACCESS_KEY_ID: ${AWS_ACCESS_KEY_ID}
      AWS_SECRET_ACCESS_KEY: ${AWS_SECRET_ACCESS_KEY}
    command: >
      mlflow server
        --host 0.0.0.0
        --port 5000
        --backend-store-uri postgresql://mlflow:${POSTGRES_PASSWORD}@postgres:5432/mlflow
        --default-artifact-root s3://${S3_BUCKET}/mlflow-artifacts
    depends_on:
      postgres:
        condition: service_healthy

volumes:
  pgdata:
```

Any team member points their tracking URI at this server, and all runs land in the same shared database.

### The Core API

The MLflow Python API is straightforward, but using it well requires understanding a few patterns.

**Basic tracking** with the context manager pattern:

```python
import mlflow
import mlflow.sklearn
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import f1_score, accuracy_score

# Point at your tracking server (or leave unset for local)
mlflow.set_tracking_uri("http://mlflow-server:5000")

# Group related runs under an experiment
mlflow.set_experiment("churn-prediction-v2")

with mlflow.start_run(run_name="rf-baseline"):
    # Log your configuration decisions
    params = {
        "n_estimators": 200,
        "max_depth": 10,
        "min_samples_split": 5,
        "class_weight": "balanced",
        "random_state": 42,
    }
    mlflow.log_params(params)

    # Train
    model = RandomForestClassifier(**params)
    model.fit(X_train, y_train)

    # Log evaluation metrics
    y_pred = model.predict(X_test)
    mlflow.log_metrics({
        "accuracy": accuracy_score(y_test, y_pred),
        "f1_macro": f1_score(y_test, y_pred, average="macro"),
        "f1_weighted": f1_score(y_test, y_pred, average="weighted"),
    })

    # Log the model itself
    mlflow.sklearn.log_model(
        sk_model=model,
        artifact_path="model",
        registered_model_name="churn-classifier",
    )

    # Log any useful artifacts
    mlflow.log_artifact("reports/confusion_matrix.png")
    mlflow.log_artifact("data/feature_importance.csv")
```

**Step-level metrics** for training curves. The `step` parameter turns a scalar metric into a time-series:

```python
import mlflow
import torch
import torch.nn as nn
from torch.optim import AdamW

mlflow.set_experiment("transformer-fine-tuning")

with mlflow.start_run(run_name="bert-base-lr-2e-5"):
    config = {
        "model": "bert-base-uncased",
        "learning_rate": 2e-5,
        "batch_size": 32,
        "epochs": 10,
        "warmup_steps": 500,
        "weight_decay": 0.01,
    }
    mlflow.log_params(config)

    # Log system tags for context
    mlflow.set_tags({
        "gpu": "A100-40GB",
        "dataset": "imdb-v3",
        "dataset_size": "25000",
    })

    for epoch in range(config["epochs"]):
        train_loss = train_epoch(model, train_loader, optimizer)
        val_loss, val_acc, val_f1 = evaluate(model, val_loader)

        # Each metric logged with step becomes a curve in the UI
        mlflow.log_metrics({
            "train_loss": train_loss,
            "val_loss": val_loss,
            "val_accuracy": val_acc,
            "val_f1": val_f1,
        }, step=epoch)

    # Log final model
    mlflow.pytorch.log_model(model, "model")
```

**Autologging** eliminates most of the boilerplate for popular frameworks. One call before training handles parameters, metrics, and model logging automatically:

```python
import mlflow

# Enable autologging for your framework
mlflow.sklearn.autolog()       # scikit-learn
mlflow.pytorch.autolog()       # PyTorch
mlflow.tensorflow.autolog()    # TensorFlow/Keras
mlflow.transformers.autolog()  # Hugging Face Transformers
mlflow.xgboost.autolog()       # XGBoost
mlflow.lightgbm.autolog()      # LightGBM

# Now just train normally — MLflow records everything
with mlflow.start_run():
    model.fit(X_train, y_train)
```

Autologging captures far more than you would log manually: every sklearn CV score, every epoch's loss and learning rate for neural networks, model signatures, feature importances. For most use cases, autologging plus a few manual `log_artifact` calls is the right balance.

### The Model Registry

The Model Registry is where experiment tracking meets deployment. It provides a structured workflow for transitioning models through stages: `Staging`, `Production`, `Archived`.

```python
from mlflow.tracking import MlflowClient

client = MlflowClient()

# After a successful training run, register the model
run_id = "abc123def456"
model_uri = f"runs:/{run_id}/model"

# Register — creates version 1 (or increments automatically)
model_version = mlflow.register_model(
    model_uri=model_uri,
    name="churn-classifier",
)

# Add descriptive metadata
client.update_model_version(
    name="churn-classifier",
    version=model_version.version,
    description="RF baseline trained on churn-v3 dataset. F1=0.87.",
)

# Promote to staging for evaluation
client.transition_model_version_stage(
    name="churn-classifier",
    version=model_version.version,
    stage="Staging",
    archive_existing_versions=False,
)

# After validation, promote to production
client.transition_model_version_stage(
    name="churn-classifier",
    version=model_version.version,
    stage="Production",
    archive_existing_versions=True,  # Automatically archive the previous production version
)
```

Loading a model by stage—not by run ID—decouples your serving code from your training code:

```python
# Serving code never needs to know which run produced the model
model = mlflow.pyfunc.load_model("models:/churn-classifier/Production")
predictions = model.predict(new_data)
```

When you promote a new model to Production, the serving code picks it up automatically on next load. Rollback is a single API call.

## Weights & Biases: The Collaboration Layer

Weights & Biases (W&B) started as a richer experiment tracking tool and has evolved into a complete ML platform. Where MLflow prioritizes self-hosting and open-source, W&B prioritizes user experience, collaboration, and breadth of capability.

The difference becomes apparent immediately when you open the dashboard. W&B renders interactive charts by default. Metrics are plotted as smooth curves. System metrics—GPU utilization, memory, CPU—are captured automatically without configuration. The UI is polished in a way that makes sharing results with non-engineers genuinely easy.

### Getting Started

```bash
pip install wandb
wandb login  # authenticates with your W&B account
```

The core API mirrors MLflow conceptually but feels more concise:

```python
import wandb

# Initialize a run — this is where configuration happens
run = wandb.init(
    project="text-classification",
    name="bert-base-warmup-500",
    config={
        "model": "bert-base-uncased",
        "learning_rate": 2e-5,
        "batch_size": 32,
        "epochs": 10,
        "warmup_steps": 500,
    },
    tags=["baseline", "bert"],
    notes="Testing linear warmup for stability in early training.",
)

# Config is now accessible and immutable for the run's lifetime
lr = wandb.config.learning_rate

for epoch in range(wandb.config.epochs):
    train_loss = train_epoch(model, train_loader)
    val_metrics = evaluate(model, val_loader)

    # Log — everything goes to wandb.ai
    wandb.log({
        "train/loss": train_loss,
        "val/loss": val_metrics["loss"],
        "val/accuracy": val_metrics["accuracy"],
        "val/f1": val_metrics["f1"],
        "epoch": epoch,
    })

# Save the model as an artifact
artifact = wandb.Artifact("bert-classifier", type="model")
artifact.add_file("model.pt")
run.log_artifact(artifact)

run.finish()
```

The namespaced keys (`train/loss`, `val/loss`) automatically group metrics into sections in the W&B UI—a small convention that pays significant dividends when you have many metrics.

### Sweeps: Hyperparameter Optimization at Scale

W&B Sweeps is where the tool genuinely separates itself. A sweep is a coordinated hyperparameter search—grid search, random search, or Bayesian optimization—that automatically manages parallel runs and surfaces the best configurations.

Define the sweep configuration:

```python
# sweep_config.py
sweep_config = {
    "method": "bayes",  # Bayesian optimization — smarter than grid or random
    "metric": {
        "name": "val/f1",
        "goal": "maximize",
    },
    "parameters": {
        "learning_rate": {
            "distribution": "log_uniform_values",
            "min": 1e-5,
            "max": 1e-3,
        },
        "batch_size": {
            "values": [16, 32, 64],
        },
        "warmup_steps": {
            "distribution": "int_uniform",
            "min": 100,
            "max": 1000,
        },
        "weight_decay": {
            "distribution": "log_uniform_values",
            "min": 1e-4,
            "max": 1e-1,
        },
        "dropout": {
            "values": [0.1, 0.2, 0.3],
        },
    },
    "early_terminate": {
        "type": "hyperband",
        "min_iter": 3,  # Terminate underperforming runs early
    },
}

import wandb

sweep_id = wandb.sweep(sweep_config, project="text-classification")
```

Write your training function to consume config from `wandb.config`:

```python
def train():
    with wandb.init() as run:
        config = run.config

        model = build_model(
            dropout=config.dropout,
        )
        optimizer = AdamW(
            model.parameters(),
            lr=config.learning_rate,
            weight_decay=config.weight_decay,
        )
        scheduler = get_linear_schedule_with_warmup(
            optimizer,
            num_warmup_steps=config.warmup_steps,
            num_training_steps=config.epochs * len(train_loader),
        )

        for epoch in range(config.epochs):
            train_loss = train_epoch(model, train_loader, optimizer, scheduler)
            val_f1 = evaluate(model, val_loader)

            wandb.log({"train/loss": train_loss, "val/f1": val_f1})
```

Launch agents to run the sweep. Each agent picks up a configuration from the sweep coordinator, trains the model, and reports results. Parallel agents mean faster search:

```bash
# Launch 4 parallel agents — each runs a configuration chosen by the Bayesian optimizer
wandb agent --count 4 your-entity/text-classification/sweep-id
```

The Bayesian optimizer learns from each completed run and steers subsequent runs toward promising regions of hyperparameter space. A sweep that would take 200 random runs to converge might find near-optimal configurations in 40 Bayesian runs.

### Artifacts and Dataset Versioning

W&B Artifacts provide versioned storage for datasets, models, and any other files. Every artifact version is linked to the runs that produced and consumed it, creating a complete data lineage graph.

```python
# Save a processed dataset as a versioned artifact
with wandb.init(project="text-classification", job_type="data-prep") as run:
    # Process the data
    processed_df = preprocess(raw_df)
    processed_df.to_csv("data/processed/train.csv", index=False)

    # Create and log the artifact
    artifact = wandb.Artifact(
        name="imdb-processed",
        type="dataset",
        description="IMDB dataset after tokenization and cleaning",
        metadata={
            "size": len(processed_df),
            "split": "train",
            "preprocessing": "bert-base-uncased tokenizer, max_len=512",
        },
    )
    artifact.add_file("data/processed/train.csv")
    run.log_artifact(artifact)  # Creates version 1 (or increments)
```

```python
# Consume the artifact in a training run — W&B records the dependency
with wandb.init(project="text-classification", job_type="train") as run:
    # Download the exact version used
    artifact = run.use_artifact("imdb-processed:latest")
    data_dir = artifact.download()

    # Train using the downloaded data
    df = pd.read_csv(f"{data_dir}/train.csv")
    # ...
```

The lineage graph that emerges from this pattern is genuinely useful. You can trace any model version back to the exact dataset version that produced it, and the exact run configuration that trained it.

## Trackio: Lightweight Hugging Face Integration

Trackio is a minimal experiment tracking library from Hugging Face, designed for one specific use case: teams that use the Hugging Face `Trainer` API and want simple, lightweight tracking without the operational overhead of running an MLflow server or signing up for a W&B account.

The entire integration happens through the `Trainer` callback mechanism:

```python
from transformers import (
    AutoModelForSequenceClassification,
    AutoTokenizer,
    Trainer,
    TrainingArguments,
)
import trackio

# Initialize Trackio — stores locally by default, or pushes to HF Hub
trackio.init(project="sentiment-classification")

training_args = TrainingArguments(
    output_dir="./results",
    num_train_epochs=5,
    per_device_train_batch_size=32,
    per_device_eval_batch_size=64,
    learning_rate=2e-5,
    warmup_ratio=0.1,
    evaluation_strategy="epoch",
    save_strategy="epoch",
    load_best_model_at_end=True,
    metric_for_best_model="f1",
    report_to="trackio",  # This single line enables Trackio tracking
)

trainer = Trainer(
    model=model,
    args=training_args,
    train_dataset=train_dataset,
    eval_dataset=eval_dataset,
    compute_metrics=compute_metrics,
)

trainer.train()
```

The `report_to="trackio"` argument is the entire integration. Every epoch's metrics, the training configuration, and the final model checkpoint are logged automatically. No context managers, no explicit `log_param` calls, no artifact handling.

Trackio is not a replacement for MLflow or W&B in complex scenarios. It is the right choice when your team is already deep in the Hugging Face ecosystem, you want tracking with zero infrastructure, and you do not need team dashboards, sweeps, or a model registry. For quick experiments and individual researchers, the simplicity is a genuine virtue.

## Neptune: Metadata Management for ML Teams

Neptune occupies an interesting position in the tracking landscape. Where MLflow is organized around experiments and runs, Neptune is organized around **metadata**. The distinction matters more than it sounds.

In Neptune, a run is a metadata namespace. You can log any metadata—parameters, metrics, artifacts, system info, custom objects—as key-value pairs with arbitrary nesting. This flexibility makes Neptune particularly well-suited for complex workflows where the structure of what you want to track is not known in advance.

```python
import neptune
import neptune.integrations.sklearn as npt_utils

# Create a run — Neptune generates a unique ID
run = neptune.init_run(
    project="your-workspace/churn-prediction",
    api_token="YOUR_API_TOKEN",
    name="gradient-boosting-sweep",
    tags=["gbm", "sweep", "v2-dataset"],
)

# Log parameters — arbitrary nesting is native
run["config/model/type"] = "GradientBoostingClassifier"
run["config/model/n_estimators"] = 300
run["config/model/learning_rate"] = 0.05
run["config/data/version"] = "churn-v2"
run["config/data/split_ratio"] = 0.8

# Log metrics during training
for epoch, (train_loss, val_loss, val_f1) in enumerate(training_loop()):
    run["metrics/train/loss"].append(train_loss)
    run["metrics/val/loss"].append(val_loss)
    run["metrics/val/f1"].append(val_f1)

# Neptune has first-class integrations with major frameworks
# This logs the full model summary, feature importances, and evaluation report
npt_utils.log_classifier_summary(
    run=run,
    classifier=model,
    X_test=X_test,
    y_test=y_test,
)

# Upload artifacts
run["artifacts/model"].upload("model.joblib")
run["artifacts/confusion_matrix"].upload("reports/cm.png")

run.stop()
```

Neptune's strength becomes apparent in enterprise scenarios. The metadata model means that every piece of information about a run—no matter how structured or unstructured—can be logged and queried uniformly. The dashboard supports rich filtering and comparison across arbitrary metadata fields. For teams with complex MLOps workflows involving multiple pipeline stages, Neptune's flexibility accommodates edge cases that rigid experiment tracking systems struggle with.

## DVC: When Your Experiment Is Your Data

DVC (Data Version Control) occupies a fundamentally different position in this landscape. While MLflow, W&B, Trackio, and Neptune are primarily experiment trackers that happen to version artifacts, DVC is primarily a **data and pipeline versioning system** that happens to track experiments.

The distinction is architectural. DVC thinks in terms of directed acyclic graphs (DAGs) of pipeline stages, each consuming and producing versioned data. An "experiment" in DVC is a variant of this pipeline with different inputs or configuration. This makes DVC the right tool when the dominant source of variation in your work is data transformation, not model hyperparameters.

### Pipelines as Code

A DVC pipeline is defined in `dvc.yaml`:

```yaml
# dvc.yaml
stages:
  prepare_data:
    cmd: python src/data/prepare.py --config configs/data.yaml
    deps:
      - src/data/prepare.py
      - configs/data.yaml
      - data/raw/transactions.csv
    params:
      - configs/data.yaml:
          - split_ratio
          - random_seed
          - min_transaction_amount
    outs:
      - data/processed/train.parquet
      - data/processed/test.parquet

  extract_features:
    cmd: python src/features/build_features.py
    deps:
      - src/features/build_features.py
      - data/processed/train.parquet
      - data/processed/test.parquet
    outs:
      - data/features/train_features.parquet
      - data/features/test_features.parquet

  train:
    cmd: python src/models/train.py --config configs/model.yaml
    deps:
      - src/models/train.py
      - configs/model.yaml
      - data/features/train_features.parquet
    params:
      - configs/model.yaml:
          - n_estimators
          - learning_rate
          - max_depth
    outs:
      - models/churn_model.pkl
    metrics:
      - reports/metrics.json:
          cache: false

  evaluate:
    cmd: python src/models/evaluate.py
    deps:
      - src/models/evaluate.py
      - models/churn_model.pkl
      - data/features/test_features.parquet
    metrics:
      - reports/metrics.json:
          cache: false
    plots:
      - reports/figures/roc_curve.csv:
          cache: false
```

Run the full pipeline:

```bash
dvc repro  # Only re-runs stages whose inputs have changed
```

DVC tracks every input and output hash. If `data/raw/transactions.csv` has not changed and `prepare.py` has not changed and the config has not changed, `prepare_data` is a no-op. This dependency-aware execution is one of DVC's most valuable properties for pipelines that operate on large data.

### DVC Experiments

DVC has a first-class experiment tracking layer that integrates with its pipeline system:

```bash
# Run an experiment with a modified parameter — no code changes needed
dvc exp run --set-param configs/model.yaml:learning_rate=0.1 --name lr-0.1

# Run several variants in one command
dvc exp run \
    --set-param configs/model.yaml:n_estimators=100 \
    --set-param configs/model.yaml:learning_rate=0.05 \
    --name "n100-lr005"

# Compare all experiments against the current baseline
dvc exp show
```

The output of `dvc exp show` is a table comparing every experiment against the current state:

```
┏━━━━━━━━━━━━━━━━━━━━━┳━━━━━━━━━┳━━━━━━━━━━┳━━━━━━━━━━━┳━━━━━━━━━━━━━━━┳━━━━━━━━━━━━━━┓
┃ Experiment          ┃ Created ┃ accuracy ┃ f1_macro  ┃ n_estimators  ┃ learning_rate┃
┡━━━━━━━━━━━━━━━━━━━━━╇━━━━━━━━━╇━━━━━━━━━━╇━━━━━━━━━━━╇━━━━━━━━━━━━━━━╇━━━━━━━━━━━━━━┩
│ workspace           │ -       │ 0.88421  │ 0.86103   │ 200           │ 0.05         │
│ main                │ Mar 20  │ 0.87992  │ 0.85741   │ 200           │ 0.05         │
│  ├── lr-0.1         │ Mar 22  │ 0.89103  │ 0.87832   │ 200           │ 0.1          │
│  ├── n100-lr005     │ Mar 23  │ 0.86740  │ 0.84192   │ 100           │ 0.05         │
│  └── n300-lr001     │ Mar 24  │ 0.90211  │ 0.88901   │ 300           │ 0.01         │
└─────────────────────┴─────────┴──────────┴───────────┴───────────────┴──────────────┘
```

Apply a successful experiment to your workspace and commit it:

```bash
dvc exp apply n300-lr001
git add configs/model.yaml reports/metrics.json
git commit -m "exp: apply n300-lr001 - F1 0.889"
```

DVC's approach to experiment tracking reflects a different philosophy: experiments are parameterized pipeline variants, and the best one gets merged into the main branch like any other code change.

## Choosing the Right Tool

The tools are not mutually exclusive, and in practice, teams often use combinations. But if you are choosing a primary tracker, the decision framework is straightforward:

| Situation | Recommended Tool |
|---|---|
| Self-hosted, full control, open-source | MLflow |
| Team collaboration, rich visualization, sweeps | Weights & Biases |
| Hugging Face Trainer, no infrastructure | Trackio |
| Complex enterprise pipelines, flexible metadata | Neptune |
| Data-heavy pipelines, versioning is the primary concern | DVC |
| Large team, production MLOps, Databricks | MLflow + Model Registry |

The combinations that work well in practice:

**DVC + MLflow**: DVC handles data versioning and pipeline execution; MLflow handles experiment metadata and model registry. They complement each other because they solve different problems. DVC's `dvc.yaml` ensures reproducible pipelines; MLflow's registry manages model promotion.

**DVC + W&B**: DVC for pipeline and data versioning; W&B for rich dashboards and team visibility. The `dvc exp run` command can be wrapped to also log to W&B, giving you both lineage tracking and collaborative dashboards.

**MLflow + Autologging**: For teams that want tracking with minimal code changes. Enable autologging per framework and add a Model Registry workflow. This covers 80% of the value with 20% of the implementation effort.

## Building a Tracking Discipline

Tools are necessary but not sufficient. The way you use them matters as much as the choice of tool. The following practices are the difference between a tracking system that helps and one that just creates noise.

### Always Log the Environment

Parameters and metrics without environment context are incomplete. At a minimum, log:

```python
import sys
import platform
import torch
import mlflow

with mlflow.start_run():
    # Your parameters...

    # Environment tags — these rarely change per run but are invaluable for debugging
    mlflow.set_tags({
        "python_version": sys.version,
        "pytorch_version": torch.__version__,
        "cuda_version": torch.version.cuda,
        "platform": platform.platform(),
        "gpu": torch.cuda.get_device_name(0) if torch.cuda.is_available() else "none",
        "git_commit": subprocess.check_output(
            ["git", "rev-parse", "HEAD"]
        ).decode().strip(),
    })
```

The `git_commit` tag is particularly important. It means that for any run, you can `git checkout <commit>` and know exactly which code produced those results.

### Use Consistent Naming Conventions

Naming experiments and runs consistently makes filtering and searching tractable at scale. A convention that works well:

```
Experiments: <model-family>/<task>/<dataset>
  transformer/sentiment/imdb-v2
  gbm/churn/telco-q1

Runs: <model-variant>/<key-config>
  bert-base/lr-2e5-bs32
  xgb/n300-lr001-depth6
```

With consistent naming, `mlflow ui` becomes searchable and you can query programmatically:

```python
from mlflow.tracking import MlflowClient

client = MlflowClient()

# Find all runs with F1 > 0.88 in the transformer experiment
runs = client.search_runs(
    experiment_names=["transformer/sentiment/imdb-v2"],
    filter_string="metrics.val_f1 > 0.88 and params.learning_rate < 1e-4",
    order_by=["metrics.val_f1 DESC"],
    max_results=10,
)

for run in runs:
    print(f"{run.info.run_name}: F1={run.data.metrics['val_f1']:.4f}")
```

### Log Before and After

A common mistake is logging only final metrics. Log early:

```python
with mlflow.start_run():
    # Log params immediately — before training starts
    mlflow.log_params(config)

    # Log data characteristics
    mlflow.log_metrics({
        "train_size": len(train_dataset),
        "val_size": len(val_dataset),
        "class_balance": positive_fraction,
    })

    # Now train...
    for epoch in range(epochs):
        mlflow.log_metrics(epoch_metrics, step=epoch)

    # Log final metrics
    mlflow.log_metrics(final_metrics)
```

If training crashes at epoch 15, you still have epochs 0–14 logged. You can diagnose whether the run was on track before it died.

### The Reproducibility Checklist

A run is truly reproducible when you can, from the logged record, reconstruct the exact result. The checklist:

- [ ] All hyperparameters logged as parameters
- [ ] Random seed logged and used in all sources of randomness (PyTorch, NumPy, Python `random`, data shuffling)
- [ ] Git commit hash logged
- [ ] Dataset version logged (or artifact linked)
- [ ] Python and key library versions tagged
- [ ] Model artifact saved with the run
- [ ] Preprocessing pipeline saved with the run (not just the model weights)

The preprocessing pipeline point is frequently missed. A model that achieves 0.91 F1 with specific normalization and tokenization decisions is not reproducible if only the weights are saved. The data transformation logic that bridges raw input to model input must travel with the model.

```python
import mlflow.sklearn
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.ensemble import GradientBoostingClassifier

# Package preprocessing and model together
full_pipeline = Pipeline([
    ("scaler", StandardScaler()),
    ("model", GradientBoostingClassifier(**model_params)),
])

full_pipeline.fit(X_train, y_train)

# Log the entire pipeline — not just the model
with mlflow.start_run():
    mlflow.sklearn.log_model(
        sk_model=full_pipeline,
        artifact_path="pipeline",
        registered_model_name="churn-full-pipeline",
    )
```

## The Broader Picture: Experiments as Assets

There is a mindset shift that separates teams that get value from experiment tracking from teams that treat it as overhead. The shift is this: experiments are not waste products of model development. They are assets.

A failed experiment that ruled out a family of architectures is valuable. It prevents the next engineer from repeating the same exploration. A successful experiment that identified which features matter most is valuable. It encodes institutional knowledge about the data. A sweep that mapped the loss surface over a hyperparameter range is valuable. It shapes every future search in that space.

None of this value is accessible if experiments live in notebooks that get overwritten, in mental notes that evaporate, in Slack messages that scroll off the screen. It is only accessible if experiments are recorded, searchable, and comparable.

The tools in this post—MLflow, W&B, Trackio, Neptune, DVC—are different answers to the same question: how do you turn the work of ML development into a compounding body of knowledge rather than a series of one-off efforts? The specific tool matters less than the discipline of using it consistently, naming things clearly, and logging completely.

When an engineer joins your team six months from now and asks "has anyone tried a learning rate above 0.01 for this model?"—the answer should be retrievable in thirty seconds, not thirty minutes of archaeology.

Build the habit before you need the history. The best time to start tracking is the first experiment. The second best time is now.

---

## References

- [MLflow Documentation](https://mlflow.org/docs/latest/index.html) — Comprehensive guide to MLflow tracking, projects, models, and registry
- [MLflow Model Registry](https://mlflow.org/docs/latest/model-registry.html) — Lifecycle management for production models
- [Weights & Biases Documentation](https://docs.wandb.ai/) — Full W&B platform reference
- [W&B Sweeps Guide](https://docs.wandb.ai/guides/sweeps) — Hyperparameter optimization with Bayesian search
- [DVC Documentation](https://dvc.org/doc) — Data versioning, pipelines, and experiment management
- [DVC Experiments](https://dvc.org/doc/user-guide/experiment-management) — Running and comparing pipeline experiments
- [Neptune Documentation](https://docs.neptune.ai/) — Metadata management for ML teams
- [Trackio on Hugging Face](https://huggingface.co/docs/trackio/en/index) — Lightweight tracking for the Transformers ecosystem
- [Sculley et al., "Hidden Technical Debt in Machine Learning Systems"](https://papers.nips.cc/paper_files/paper/2015/hash/86df7dcfd896fcaf2674f757a2463eba-Abstract.html) — The foundational paper on ML system complexity
- [Zaharia et al., "Accelerating the Machine Learning Lifecycle with MLflow"](https://cs.stanford.edu/~matei/papers/2018/ieee_mlflow.pdf) — Original MLflow paper
