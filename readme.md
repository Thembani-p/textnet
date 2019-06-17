# textNet

## initial setup

- java installation
  - [java](http://tipsonubuntu.com/2016/07/31/install-oracle-java-8-9-ubuntu-16-04-linux-mint-18/)
- tutorial files
  - [plos article](https://journals.plos.org/plosone/article?id=10.1371/journal.pone.0172002)
  - proper noun, full graph
  - windows 25, 50, 75
- Stanford POStagger [taggers](https://nlp.stanford.edu/software/tagger.html), [ner](https://nlp.stanford.edu/software/CRF-NER.html)
  - [ner](https://nlp.stanford.edu/software/stanford-ner-2014-08-27.zip)
  - [pos](https://nlp.stanford.edu/software/stanford-postagger-full-2018-10-16.zip)

## java

```sh
sudo add-apt-repository ppa:webupd8team/java
sudo apt update; sudo apt install oracle-java8-installer
javac -version
sudo apt install openjdk-8-jdk-headless
```

## Stanford

### NER

```sh
$ wget -P input/stanford https://nlp.stanford.edu/software/stanford-ner-2014-08-27.zip
$ unzip input/stanford/stanford-ner-2014-08-27.zip -d input/stanford/.
```

### POS

```sh
$ wget -P input/stanford https://nlp.stanford.edu/software/stanford-postagger-full-2018-10-16.zip
$ unzip input/stanford/stanford-postagger-full-2018-10-16.zip -d input/stanford/.
```

## Environment

Setup virtual environment.

```sh
$ virtualenv -p python3 tn_env
$ source tn_env/bin/activate
(tn_env) $ pip install -r requirements.txt
```

Download nltk files.

```python
import nltk
nltk.download('punkt')
```

## Data model

- Project
  - methods
    - read (data)
    - write (object, data)
  - data | uri (type)
    - text (txt)
    - full (json)
    - merge_pickle (pickle)
    - merged (json)
    - viz (json)
    - graphml (graphml)

## Tutorial

```python
from textnet.graphs import new_graph

with open('plos.txt', 'r' ,encoding='latin-1') as datafile:
  textline = datafile.read()

for window in [25, 50, 75]:
  for filter in [None, 'nnp']:
    filter_string = '' if filter == None else 'f'
    project_name = ''.join(['plos', str(window), filter_string])
    graph_name = new_graph(textline, window, project_name, filter)
    graph_options(graph_name)
```

## Updates

- data model for file system*
- adjust data model for cloud storage
- wtforms for form handling
- module project structure with manage.py
- unit tests for textnet module
- projects with pagination

## App engine deployment

- cloud storage
  - folder structure
    - project
      - merge.json
      - merge.pickle
      - viz.json
      - .graphml
      - .json
- data store

## Running locally

If you're running the app from a virtual environment don't use `python app.py` unless you specify the python shebang to something other than: `#!/usr/bin/env python`. Preferably use `flask run`.
