---
title: "Structuring Machine Learning Projects: From Chaos to Production-Ready"
date: "2025-11-11"
excerpt: "Most ML projects die in the chaos of unversioned notebooks and dependency hell. This is the definitive guide to structuring projects that scale—from folder architecture to Git workflows, from Poetry mastery to the bridge between experimentation and production."
tags: ["MLOps", "Python", "Project Structure", "Poetry", "Git", "Best Practices"]
headerImage: "/blog/headers/ml-projects-header.jpg"
readingTimeMinutes: 35
slug: structuring-ml-projects
estimatedWordCount: 7500
---

# Structuring Machine Learning Projects: From Chaos to Production-Ready

## The Graveyard of Notebooks

Every data scientist has a graveyard. A folder—perhaps innocently named `experiments/` or `notebooks_old/`—filled with cryptic files: `model_final_v2_REAL.ipynb`, `data_processing_backup_USE_THIS.py`, `requirements_old_but_works.txt`. Each file represents a moment of desperation, a quick fix that became permanent, a shortcut that closed a door.

This chaos is not a personal failing. It is the natural consequence of applying traditional software intuitions to a fundamentally different problem domain. Machine Learning projects are not software projects with extra math. They are experiments that sometimes become software—and that distinction changes everything.

Traditional software development operates in a world of deterministic logic. Given the same inputs, functions produce the same outputs. The challenge is managing complexity, not uncertainty. But ML lives in a different universe: one where the "correct" output is unknown, where success is probabilistic, where the path from idea to production passes through dozens of failed experiments.

This guide is not another list of tips. It is a comprehensive framework for structuring ML projects that acknowledges this fundamental difference—projects that can scale from a weekend prototype to a production system serving millions of predictions, projects where four engineers can collaborate without stepping on each other's work, projects where an experiment from six months ago can be reproduced exactly.

We will cover everything: folder architecture, dependency management with Poetry, Git workflows adapted for ML, quality tooling, the notebook-to-production pipeline, and the decision framework for choosing the right level of structure for your specific situation.

This is the reference document. Bookmark it.

## The Anatomy of an ML Project

### The Standard Structure

Let us begin with the structure itself. The following layout has emerged as a de facto standard across the industry, refined through years of collective experience and formalized by projects like Cookiecutter Data Science:

```
project_name/
├── .github/
│   └── workflows/
│       └── ci.yml
├── configs/
│   ├── model/
│   │   └── default.yaml
│   └── training/
│       └── default.yaml
├── data/
│   ├── raw/
│   ├── interim/
│   ├── processed/
│   └── external/
├── docs/
│   └── README.md
├── models/
│   └── .gitkeep
├── notebooks/
│   ├── 01_exploration/
│   ├── 02_preprocessing/
│   ├── 03_modeling/
│   └── 04_evaluation/
├── reports/
│   └── figures/
├── src/
│   └── project_name/
│       ├── __init__.py
│       ├── data/
│       │   ├── __init__.py
│       │   ├── make_dataset.py
│       │   └── preprocessing.py
│       ├── features/
│       │   ├── __init__.py
│       │   └── build_features.py
│       ├── models/
│       │   ├── __init__.py
│       │   ├── train.py
│       │   ├── predict.py
│       │   └── evaluate.py
│       ├── visualization/
│       │   ├── __init__.py
│       │   └── visualize.py
│       └── utils/
│           ├── __init__.py
│           └── helpers.py
├── tests/
│   ├── __init__.py
│   ├── test_data.py
│   ├── test_features.py
│   └── test_models.py
├── .gitignore
├── .pre-commit-config.yaml
├── Makefile
├── pyproject.toml
├── poetry.lock
└── README.md
```

This is not arbitrary. Each directory serves a specific purpose, and understanding that purpose is essential to using the structure effectively.

### Directory-by-Directory Breakdown

**`.github/workflows/`**: GitHub Actions configurations for continuous integration. Every push triggers automated tests, linting, and potentially model validation. This is not optional for collaborative projects—it is the immune system that prevents regressions.

**`configs/`**: Configuration files separated from code. This is crucial for ML projects where hyperparameters, model architectures, and training settings change frequently. Tools like Hydra or OmegaConf can load these YAML files dynamically, enabling reproducible experiments without code changes.

**`data/`**: The data layer, subdivided by processing stage:
- `raw/`: Immutable original data. Never modified. This is your ground truth, your archaeological record. If someone asks "what did the original data look like?", you point here.
- `interim/`: Intermediate transformations. Partially processed data that serves as checkpoints in your pipeline. Delete freely when needed.
- `processed/`: Final, clean datasets ready for modeling. Feature-engineered, normalized, split into train/test.
- `external/`: Data from external sources—third-party datasets, reference tables, lookup data.

**`docs/`**: Project documentation beyond the README. Architecture decisions, API documentation, onboarding guides. For complex projects, consider using Sphinx or MkDocs to generate navigable documentation.

**`models/`**: Serialized model artifacts—trained weights, checkpoints, exported models. The `.gitkeep` file is a convention to ensure Git tracks the empty directory. Actual model files are typically too large for Git and should be tracked with DVC or stored in cloud storage.

**`notebooks/`**: Jupyter notebooks organized by phase. The numbered prefixes enforce ordering and make the experimental narrative clear. Notebooks are for exploration—they are not production code. More on this critical distinction later.

**`reports/`**: Generated analysis, HTML reports, and figures. This is where you store the artifacts that communicate results to stakeholders—people who will never read your code but need to understand your findings.

**`src/project_name/`**: The production-ready source code, organized as a proper Python package:
- `data/`: Scripts for data ingestion, downloading, and initial processing.
- `features/`: Feature engineering transformations. Anything that converts raw data into model inputs.
- `models/`: Model definitions, training loops, prediction interfaces, evaluation metrics.
- `visualization/`: Plotting utilities and visualization generation.
- `utils/`: Shared utilities that do not fit elsewhere.

**`tests/`**: Unit and integration tests. Yes, ML projects need tests. Not for model accuracy—that is evaluation—but for data pipeline correctness, feature engineering logic, and inference code behavior.

### Why This Structure Works

This organization enforces several principles that are easy to state but hard to maintain without structural support:

**Separation of concerns**: Data processing, feature engineering, modeling, and visualization live in distinct modules. Changes to one do not cascade unpredictably to others.

**Reproducibility by default**: Raw data is immutable. Processed data can be regenerated. Configuration is externalized. The path from raw data to trained model is traceable.

**Clear ownership**: When something breaks, you know where to look. Data pipeline issues? Check `src/data/`. Model performance degradation? Check `src/models/`. This clarity accelerates debugging.

**Scalability**: The structure accommodates growth. A project that starts with one model and one dataset can expand to dozens of models and data sources without restructuring.

## Poetry: Modern Dependency Management

### Why Poetry Over pip

Dependency management is the unglamorous foundation upon which reproducibility rests. A project that works on your machine but breaks on your colleague's machine is not a project—it is a prototype with delusions of grandeur.

Traditional Python dependency management—`pip install` and `requirements.txt`—has fundamental limitations:

**No dependency resolution**: pip does not resolve dependency conflicts intelligently. Install package A which requires `numpy>=1.20`, then package B which requires `numpy<1.19`, and pip will happily break your environment.

**No distinction between direct and transitive dependencies**: Your `requirements.txt` either contains only direct dependencies (risking version drift in transitive deps) or contains every single package (making updates terrifying).

**No lock file by default**: Two people running `pip install -r requirements.txt` at different times may get different package versions.

Poetry solves all of these problems:

**Deterministic resolution**: Poetry's resolver ensures that all dependencies are compatible before installing anything.

**Lock files**: `poetry.lock` captures the exact version of every package—direct and transitive. Anyone installing from this lock file gets identical packages.

**Separated dependency groups**: Development dependencies (pytest, black, mypy) are separated from production dependencies. Your production container does not need your linting tools.

**Built-in virtual environment management**: Poetry creates and manages virtual environments automatically, eliminating the "did I activate the venv?" class of errors.

### The pyproject.toml Deep Dive

The `pyproject.toml` file is the single source of truth for your project's metadata and dependencies. Here is a comprehensive example for an ML project:

```toml
[tool.poetry]
name = "project-name"
version = "0.1.0"
description = "A machine learning project for X"
authors = ["Your Name <your.email@example.com>"]
readme = "README.md"
packages = [{include = "project_name", from = "src"}]

[tool.poetry.dependencies]
python = "^3.10"
numpy = "^1.24.0"
pandas = "^2.0.0"
scikit-learn = "^1.3.0"
torch = "^2.0.0"
pyyaml = "^6.0"
hydra-core = "^1.3.0"
mlflow = "^2.8.0"
python-dotenv = "^1.0.0"

[tool.poetry.group.dev.dependencies]
pytest = "^7.4.0"
pytest-cov = "^4.1.0"
ruff = "^0.1.0"
mypy = "^1.7.0"
pre-commit = "^3.5.0"
ipykernel = "^6.25.0"
jupyter = "^1.0.0"
nbstripout = "^0.6.0"

[tool.poetry.group.docs.dependencies]
mkdocs = "^1.5.0"
mkdocs-material = "^9.4.0"

[build-system]
requires = ["poetry-core"]
build-backend = "poetry.core.masonry.api"

[tool.ruff]
line-length = 88
select = ["E", "F", "I", "N", "W", "UP"]
ignore = ["E501"]
target-version = "py310"

[tool.ruff.isort]
known-first-party = ["project_name"]

[tool.mypy]
python_version = "3.10"
warn_return_any = true
warn_unused_configs = true
ignore_missing_imports = true

[tool.pytest.ini_options]
testpaths = ["tests"]
python_files = "test_*.py"
addopts = "-v --cov=src/project_name --cov-report=term-missing"

[tool.coverage.run]
source = ["src/project_name"]
omit = ["*/__init__.py", "*/tests/*"]
```

Let us examine the key sections:

**`[tool.poetry]`**: Project metadata. The `packages` directive is crucial—it tells Poetry where to find your importable Python package. The `from = "src"` pattern (known as the "src layout") prevents accidental imports of uninstalled local code.

**`[tool.poetry.dependencies]`**: Production dependencies. These are what your deployed model needs to run. The caret (`^`) syntax means "compatible with"—`^2.0.0` allows `2.x.y` but not `3.0.0`.

**`[tool.poetry.group.dev.dependencies]`**: Development dependencies. Testing frameworks, linters, formatters, notebook tools. These never reach production.

**`[tool.poetry.group.docs.dependencies]`**: Documentation dependencies, separated because not everyone needs to build docs.

**Tool configurations**: Ruff, mypy, pytest, and coverage are configured directly in `pyproject.toml`, eliminating the need for separate configuration files.

### Essential Poetry Commands

```bash
# Create a new project
poetry new project-name
# Or initialize in existing directory
poetry init

# Add production dependency
poetry add pandas

# Add dev dependency
poetry add --group dev pytest

# Install all dependencies
poetry install

# Install only production dependencies
poetry install --only main

# Update dependencies (respecting version constraints)
poetry update

# Update a specific package
poetry update pandas

# Show dependency tree
poetry show --tree

# Export to requirements.txt (for environments that need it)
poetry export -f requirements.txt --output requirements.txt

# Run a command in the virtual environment
poetry run python src/project_name/models/train.py

# Activate the virtual environment shell
poetry shell

# Build the package
poetry build
```

### Managing Python Versions

Poetry works seamlessly with pyenv for Python version management:

```bash
# Install specific Python version
pyenv install 3.10.12

# Set local Python version for project
pyenv local 3.10.12

# Tell Poetry to use this version
poetry env use 3.10.12
```

## Git Workflows for Machine Learning

### The Challenge of ML Version Control

Traditional Git workflows—GitFlow, GitHub Flow, Trunk-Based Development—were designed for software where the unit of work is a feature or bug fix. ML projects have a different unit of work: the experiment.

An experiment might involve:
- Trying a new model architecture
- Adjusting hyperparameters
- Testing a feature engineering hypothesis
- Evaluating on a different dataset split

Most experiments fail. That is not a bug—it is the scientific method working as intended. But traditional Git workflows treat every branch as something that should eventually merge. This creates friction when the majority of your branches represent experiments that will be abandoned.

### Recommended Workflow: Simplified Feature Branch

For ML teams, a simplified feature branch workflow balances structure with flexibility:

**Main branch** (`main`): Always deployable. Represents the current production state. Protected—no direct commits.

**Development branch** (`develop`): Integration branch where features are merged before going to main. Optional for smaller teams, but useful for larger ones.

**Feature branches** (`feature/descriptive-name`): For new capabilities, refactors, and infrastructure changes.

**Experiment branches** (`exp/experiment-name`): For ML experiments that may or may not merge. These have a different lifecycle than feature branches.

**Hotfix branches** (`hotfix/issue-description`): Emergency fixes that go directly to main.

The key insight is separating **experiments** from **features**. Features follow the traditional merge workflow. Experiments have a more fluid lifecycle—they may merge if successful, transform into features if partially successful, or simply be archived if unsuccessful.

### Branch Naming Conventions

Clear naming eliminates ambiguity:

```
feature/add-data-augmentation
feature/implement-transformer-encoder
feature/refactor-training-pipeline

exp/bert-base-vs-roberta
exp/learning-rate-sweep-0.001-0.1
exp/augmentation-ablation-study

hotfix/fix-memory-leak-inference
hotfix/correct-preprocessing-bug

docs/update-readme
docs/add-architecture-diagram
```

The prefix immediately communicates intent. When reviewing branches, you know that `feature/` branches should be reviewed for code quality and architectural fit, while `exp/` branches might be reviewed primarily for whether the experiment answered its question.

### Commit Message Conventions

Adopt Conventional Commits for machine-readable commit history:

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

Types for ML projects:
- `feat`: New feature or capability
- `fix`: Bug fix
- `data`: Changes to data processing
- `model`: Changes to model architecture or training
- `exp`: Experiment-related changes
- `refactor`: Code restructuring without behavior change
- `test`: Adding or modifying tests
- `docs`: Documentation changes
- `ci`: CI/CD changes
- `chore`: Maintenance tasks

Examples:

```
feat(data): add image augmentation pipeline

Implements random rotation, flipping, and color jitter
for training data augmentation.

Closes #45
```

```
model(training): implement learning rate warmup

Adds linear warmup for first 1000 steps to stabilize
early training dynamics.
```

```
exp(bert): test frozen embeddings vs fine-tuned

Experiment comparing BERT with frozen vs trainable
embeddings on classification task.

Results: Frozen achieves 0.82 F1, fine-tuned achieves 0.87 F1.
Proceeding with fine-tuned approach.
```

### The .gitignore for ML Projects

A comprehensive `.gitignore` prevents accidental commits of large files and secrets:

```gitignore
# Byte-compiled / optimized / DLL files
__pycache__/
*.py[cod]
*$py.class

# Distribution / packaging
dist/
build/
*.egg-info/

# Virtual environments
.venv/
venv/
ENV/

# IDE
.idea/
.vscode/
*.swp
*.swo

# Jupyter Notebook checkpoints
.ipynb_checkpoints/

# Data files (tracked with DVC if needed)
data/raw/*
data/interim/*
data/processed/*
data/external/*
!data/*/.gitkeep

# Model artifacts (tracked with DVC if needed)
models/*
!models/.gitkeep

# Reports and figures
reports/figures/*
!reports/figures/.gitkeep

# Logs
logs/
*.log
mlruns/
wandb/

# Environment files
.env
.env.local
*.env

# OS
.DS_Store
Thumbs.db

# Large files
*.h5
*.hdf5
*.pkl
*.pickle
*.joblib
*.pt
*.pth
*.onnx
*.bin
*.safetensors

# Secrets
secrets/
credentials/
*.pem
*.key
```

### When to Use DVC

Data Version Control (DVC) extends Git to handle large files—datasets, model weights, artifacts. Use DVC when:

- Datasets exceed 100MB
- Model checkpoints need version control
- You need to reproduce exact training data states
- Multiple team members need synchronized data access

DVC tracks large files externally (S3, GCS, Azure Blob) while storing lightweight pointers in Git. This gives you Git-like versioning semantics without bloating your repository.

## Quality Tooling: Pre-commit and Beyond

### The Case for Automated Quality

Code review is expensive. Every minute a senior engineer spends commenting "add a blank line here" is a minute not spent on architectural feedback. Automated tooling handles the mechanical aspects of code quality, freeing human review for semantic questions.

### Pre-commit Configuration

Pre-commit runs checks before each commit, preventing quality issues from entering the repository:

```yaml
# .pre-commit-config.yaml
repos:
  - repo: https://github.com/pre-commit/pre-commit-hooks
    rev: v4.5.0
    hooks:
      - id: trailing-whitespace
      - id: end-of-file-fixer
      - id: check-yaml
      - id: check-json
      - id: check-added-large-files
        args: ['--maxkb=1000']
      - id: check-merge-conflict
      - id: detect-private-key

  - repo: https://github.com/astral-sh/ruff-pre-commit
    rev: v0.1.6
    hooks:
      - id: ruff
        args: [--fix, --exit-non-zero-on-fix]
      - id: ruff-format

  - repo: https://github.com/pre-commit/mirrors-mypy
    rev: v1.7.0
    hooks:
      - id: mypy
        additional_dependencies: [types-PyYAML, types-requests]
        args: [--ignore-missing-imports]

  - repo: https://github.com/kynan/nbstripout
    rev: 0.6.1
    hooks:
      - id: nbstripout
```

Installation:

```bash
poetry add --group dev pre-commit
poetry run pre-commit install
poetry run pre-commit run --all-files  # Run on all files initially
```

### Why Ruff Over Black + Flake8 + isort

Ruff is a Rust-based linter and formatter that replaces Black, Flake8, isort, and dozens of other tools—at 10-100x the speed. For ML projects with large codebases, this speed difference is tangible.

Ruff configuration in `pyproject.toml`:

```toml
[tool.ruff]
line-length = 88
target-version = "py310"

select = [
    "E",    # pycodestyle errors
    "F",    # pyflakes
    "I",    # isort
    "N",    # pep8-naming
    "UP",   # pyupgrade
    "B",    # flake8-bugbear
    "C4",   # flake8-comprehensions
    "SIM",  # flake8-simplify
]

ignore = [
    "E501",  # line too long (handled by formatter)
]

[tool.ruff.isort]
known-first-party = ["project_name"]

[tool.ruff.per-file-ignores]
"tests/*" = ["S101"]  # Allow assert in tests
"notebooks/*" = ["E402"]  # Allow imports not at top in notebooks
```

### Type Hints and mypy

Type hints dramatically improve code maintainability and catch errors before runtime:

```python
from typing import Optional
import pandas as pd
import numpy as np
from numpy.typing import NDArray

def preprocess_data(
    df: pd.DataFrame,
    target_column: str,
    drop_columns: Optional[list[str]] = None,
) -> tuple[NDArray[np.float32], NDArray[np.int64]]:
    """
    Preprocess dataframe for model training.
    
    Args:
        df: Input dataframe
        target_column: Name of target variable column
        drop_columns: Columns to exclude from features
        
    Returns:
        Tuple of (features array, labels array)
    """
    if drop_columns is None:
        drop_columns = []
    
    feature_columns = [c for c in df.columns 
                       if c != target_column and c not in drop_columns]
    
    X = df[feature_columns].values.astype(np.float32)
    y = df[target_column].values.astype(np.int64)
    
    return X, y
```

### The Makefile: Automation Hub

A Makefile centralizes common operations, providing a consistent interface regardless of underlying tools:

```makefile
.PHONY: install test lint format clean train evaluate

# Environment
install:
	poetry install

install-dev:
	poetry install --with dev,docs

# Quality
lint:
	poetry run ruff check src tests
	poetry run mypy src

format:
	poetry run ruff format src tests
	poetry run ruff check --fix src tests

test:
	poetry run pytest tests/ -v --cov=src/project_name

test-fast:
	poetry run pytest tests/ -v -x --ff

# Data
data-process:
	poetry run python src/project_name/data/make_dataset.py

# Training
train:
	poetry run python src/project_name/models/train.py

train-config:
	poetry run python src/project_name/models/train.py --config $(CONFIG)

evaluate:
	poetry run python src/project_name/models/evaluate.py

# Documentation
docs-serve:
	poetry run mkdocs serve

docs-build:
	poetry run mkdocs build

# Cleanup
clean:
	find . -type d -name "__pycache__" -exec rm -rf {} +
	find . -type d -name ".pytest_cache" -exec rm -rf {} +
	find . -type d -name ".mypy_cache" -exec rm -rf {} +
	find . -type d -name ".ruff_cache" -exec rm -rf {} +
	rm -rf dist/ build/ *.egg-info/

clean-data:
	rm -rf data/interim/* data/processed/*
	touch data/interim/.gitkeep data/processed/.gitkeep
```

Now anyone can run `make train` without knowing the underlying Python commands. Onboarding becomes trivial: "clone the repo, run `make install`, run `make test`."

## From Notebooks to Production

### The Notebook Paradox

Notebooks are simultaneously the best and worst thing to happen to data science. They are unparalleled for exploration, visualization, and iterative development. They are terrible for production code, version control, and testing.

The resolution is not to abandon notebooks but to use them correctly: as exploration tools, not production artifacts.

### The Notebook Lifecycle

**Phase 1: Exploration** (notebook-native)
- Rapid iteration
- Inline visualizations
- Markdown documentation of thought process
- Acceptable to have messy, non-reusable code

**Phase 2: Consolidation** (notebook to functions)
- Extract working code into functions
- Functions still defined in notebook cells
- Test functions with simple assertions
- Document function interfaces

**Phase 3: Extraction** (functions to modules)
- Move tested functions to `src/` modules
- Import functions back into notebook
- Notebook becomes thin orchestration layer
- Original exploration preserved as documentation

**Phase 4: Production** (scripts and pipelines)
- Training script uses modules from `src/`
- Configuration externalized to YAML
- Logging replaces print statements
- Error handling added

### Practical Extraction Example

In notebook (exploration phase):

```python
# Cell 1: Data loading and exploration
import pandas as pd

df = pd.read_csv("data/raw/transactions.csv")
print(df.shape)
df.head()
```

```python
# Cell 2: Feature engineering exploration
df['hour'] = pd.to_datetime(df['timestamp']).dt.hour
df['day_of_week'] = pd.to_datetime(df['timestamp']).dt.dayofweek
df['is_weekend'] = df['day_of_week'].isin([5, 6]).astype(int)
```

After extraction, in `src/project_name/features/build_features.py`:

```python
"""Feature engineering functions for transaction data."""
import pandas as pd


def add_temporal_features(df: pd.DataFrame, timestamp_col: str = "timestamp") -> pd.DataFrame:
    """
    Add temporal features derived from timestamp.
    
    Args:
        df: Input dataframe with timestamp column
        timestamp_col: Name of the timestamp column
        
    Returns:
        Dataframe with additional temporal features
    """
    df = df.copy()
    ts = pd.to_datetime(df[timestamp_col])
    
    df["hour"] = ts.dt.hour
    df["day_of_week"] = ts.dt.dayofweek
    df["is_weekend"] = df["day_of_week"].isin([5, 6]).astype(int)
    
    return df
```

The notebook now becomes:

```python
# Cell 1: Import and load
import pandas as pd
from project_name.features.build_features import add_temporal_features

df = pd.read_csv("data/raw/transactions.csv")

# Cell 2: Apply features
df = add_temporal_features(df)
```

### Keeping Notebooks Clean with nbstripout

Notebooks store output cells and execution counts in their JSON structure. These create noisy diffs and bloat the repository. nbstripout removes outputs before commit:

```bash
poetry add --group dev nbstripout
nbstripout --install  # Installs as git filter
```

Now notebooks are committed without outputs—cleaner diffs, smaller repo, and no accidentally committed data visualizations.

## Experiment Tracking

### The Problem with Manual Tracking

"I tried learning rate 0.001 last Tuesday and got 0.87 accuracy... or was it 0.0001? And which commit was that?"

Manual experiment tracking fails because:
- Human memory is unreliable
- Spreadsheets become outdated
- Results get scattered across notebooks
- Reproducing "that good run from last month" becomes archaeology

### MLflow: The Open-Source Standard

MLflow provides experiment tracking, model registry, and deployment capabilities. Basic integration:

```python
import mlflow
from mlflow.tracking import MlflowClient

# Set experiment
mlflow.set_experiment("classification-experiments")

# Start run
with mlflow.start_run(run_name="baseline-model"):
    # Log parameters
    mlflow.log_param("model_type", "random_forest")
    mlflow.log_param("n_estimators", 100)
    mlflow.log_param("max_depth", 10)
    
    # Train model
    model = train_model(X_train, y_train)
    
    # Log metrics
    accuracy = evaluate_model(model, X_test, y_test)
    mlflow.log_metric("accuracy", accuracy)
    mlflow.log_metric("f1_score", f1)
    
    # Log artifacts
    mlflow.log_artifact("reports/figures/confusion_matrix.png")
    
    # Log model
    mlflow.sklearn.log_model(model, "model")
```

### Weights and Biases: The Managed Alternative

For teams wanting a managed solution with superior visualization, Weights and Biases (W&B) offers:

- Automatic hyperparameter sweeps
- Rich visualization dashboards
- Team collaboration features
- GPU monitoring

```python
import wandb

wandb.init(project="my-ml-project", config={
    "learning_rate": 0.001,
    "epochs": 100,
    "batch_size": 32
})

for epoch in range(epochs):
    loss, accuracy = train_epoch(model, data)
    wandb.log({
        "epoch": epoch,
        "loss": loss,
        "accuracy": accuracy
    })

wandb.finish()
```

### Choosing Between Tools

**MLflow** when:
- Self-hosted infrastructure required
- Open-source preference
- Integration with existing Databricks stack
- Cost sensitivity (it is free)

**Weights and Biases** when:
- Team collaboration is priority
- Advanced visualization needed
- Hyperparameter sweep automation valued
- Managed service preferred

**Vertex AI Experiments** when:
- Already on Google Cloud
- Need tight GCP integration
- Want unified training and tracking

## Scaling the Structure

### For Small Projects (Solo, 1-2 weeks)

Not every project needs the full structure. For quick explorations:

```
quick_experiment/
├── notebooks/
│   └── exploration.ipynb
├── data/
│   └── sample.csv
├── pyproject.toml
└── README.md
```

Even minimal projects benefit from:
- Poetry for dependencies (reproducibility matters even for experiments)
- A README documenting what you tried
- Git tracking (you will want to return to this)

### For Medium Projects (Small team, 1-3 months)

The standard structure with pragmatic simplifications:

```
medium_project/
├── configs/
├── data/
│   ├── raw/
│   └── processed/
├── notebooks/
├── src/
│   └── project_name/
├── tests/
├── .gitignore
├── pyproject.toml
├── Makefile
└── README.md
```

Add:
- Pre-commit hooks
- Basic CI (tests run on PR)
- Experiment tracking (even a simple MLflow setup)

### For Large Projects (Multiple teams, ongoing)

The full structure plus:

```
large_project/
├── .github/
│   └── workflows/
│       ├── ci.yml
│       ├── cd.yml
│       └── model-validation.yml
├── configs/
│   ├── model/
│   ├── training/
│   └── deployment/
├── data/
├── docs/
├── infrastructure/
│   ├── docker/
│   ├── kubernetes/
│   └── terraform/
├── models/
├── notebooks/
├── pipelines/
│   ├── training/
│   └── inference/
├── src/
│   └── project_name/
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
├── dvc.yaml
├── dvc.lock
└── ...
```

Add:
- Infrastructure as Code
- Multiple CI/CD pipelines
- DVC for data versioning
- Model validation gates
- Comprehensive documentation

## The Principles Behind the Practices

Every recommendation in this guide derives from a few core principles:

**Reproducibility is non-negotiable.** An experiment that cannot be reproduced is an anecdote, not evidence. Lock your dependencies. Version your data. Document your configuration.

**Separation enables evolution.** Data pipelines evolve independently of models. Models evolve independently of deployment. Coupling these tightly creates brittle systems.

**Automation beats discipline.** Humans forget. Humans get lazy. Automated checks do not. Pre-commit hooks, CI pipelines, and Makefiles encode best practices into the workflow itself.

**Structure should match complexity.** A weekend project does not need Kubernetes. A production system does not tolerate notebook spaghetti. Match the structure to the problem.

**The goal is insight, not ceremony.** Every practice here serves the ultimate goal: producing ML systems that work, can be understood, and can be improved. If a practice creates friction without value, discard it.

---

## Going Deeper

**Project Templates:**
- [Cookiecutter Data Science](https://drivendata.github.io/cookiecutter-data-science/) — The original and still excellent
- [cookiecutter-ml](https://github.com/Akramz/cookiecutter-ml) — Poetry-integrated ML template

**Dependency Management:**
- [Poetry Documentation](https://python-poetry.org/docs/) — Official docs, comprehensive
- [pyproject.toml specification](https://packaging.python.org/en/latest/specifications/pyproject-toml/) — The standard

**Git Workflows:**
- [Atlassian Git Tutorials](https://www.atlassian.com/git/tutorials) — Excellent visualizations
- [Conventional Commits](https://www.conventionalcommits.org/) — Commit message standard

**MLOps and Experiment Tracking:**
- [MLflow Documentation](https://mlflow.org/docs/latest/index.html) — Getting started guides
- [Weights and Biases Docs](https://docs.wandb.ai/) — Tutorials and best practices
- [DVC Documentation](https://dvc.org/doc) — Data version control

**Quality Tooling:**
- [Ruff Documentation](https://docs.astral.sh/ruff/) — The fast linter
- [mypy Documentation](https://mypy.readthedocs.io/) — Static type checking
- [pre-commit](https://pre-commit.com/) — Git hooks framework

---

The structure of a project is not bureaucracy—it is the skeleton that allows the organism to move. Get it right, and everything else becomes easier. Get it wrong, and even simple tasks become struggles against accumulated entropy.

Build the foundation before you build the model. Your future self—and your teammates—will thank you.

