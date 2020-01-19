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

```sh
python -m ipykernel install --user --name tn_env --display-name "textnet"
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
from textnet.graphs import new_graph, graph_options
from textnet.models import Project

with open('plos.txt', 'r' ,encoding='latin-1') as datafile:
  textline = datafile.read()

for window in [25, 50, 75]:
  for filter in ['all', 'nnp']:
    # filter_string = 'f' if filter == 'all' else ''
    filter_object = None if filter == 'all' else filter
    project_name = '_'.join(['plos', str(window), filter])        
    graph_name = new_graph(textline, window, project_name, filter_object)
    meta = {
            'name': graph_name,
            'type': 'sample',
            'window': window,
            'filter': filter
    }
    project = Project(graph_name)
    project.write(meta, project.meta)
    graph_options(graph_name)
```

## Textnet original backup

Backups of the original Textnet project files.

```python
import os
import requests
import lxml.html as html

if not os.path.isdir('backup'):
  os.makedirs('backup')

string = requests.get("http://app.textnet.co.za/files")
root  = html.fromstring(string.text)
links = root.xpath('//tr/td/a')

for link in links:
  filename = "{}.text".format(link.text.replace("/",""))
  url = "http://app.textnet.co.za/files/{}{}".format(link.text, filename)
  print(url)
  string = requests.get(url)
  if len(string.text) >= 500:
    with open(os.path.join('backup', filename), 'w') as datafile:
      datafile.write(string.text)

# len(os.listdir('backup')) # 232
#
# texts = []
# for text in os.listdir('backup'):
#   text_path = os.path.join('backup', text)
#   with open(text_path, 'r') as datafile:
#     texts.append(datafile.read())
#
# sizes = np.array([len(i) for i in texts])
# sizes[sizes < 500]
# effective = np.array(os.listdir('backup'))[sizes < 500]
```

A new take on the projects with window 25 and no part of speech filter. Some will fail thus the error handling measure. All projects are backedup to GCS.

```python
import os
import urllib
import shutil
from google.cloud import storage
from textnet.graphs import new_graph, graph_options
from textnet.models import Project

os.environ["GCS"] = 'True'

window = 25
filter = 'all'

for filename in os.listdir('backup'):
  try:
    file_path = os.path.join('backup', filename)
    with open(file_path, 'r', encoding='latin-1') as datafile:
      textline = datafile.read()
    project_name = filename.replace('.text','')
    project_name = project_name.translate(str.maketrans('', '', string.punctuation))
    print(project_name)
    graph_name = new_graph(textline, window, project_name, None)
    meta = {
            'name': graph_name,
            'type': 'public',
            'source': 'textnet-one',
            'window': window,
            'filter': filter
    }
    project = Project(graph_name)
    project.write(meta, project.meta)
    graph_options(graph_name)
  except:
    print('failed :( \n')
    continue

failed = [i for i in os.listdir('files') if not Project(i).exists(Project(i).meta.uri)]

# remove failed projects
for fail in failed:
  project = Project(fail)
  print(project.project_path)
  shutil.rmtree(project.project_path)
```

## Updates

- data model for file system*
- adjust data model for cloud storage (not sure if this can work universally, for reading and writing)
- wtforms for form handling* (only for the index page)
- module project structure with manage.py* (still app.py)
- unit tests for textnet module
- projects with pagination*
- project meta
  - type* (sample, public, private),
  - creator (email, confirm_id), | confirm_id gets emailed to the creator
  - specifications* (window, filter)
- textnet one backup*
- project editing

## App engine deployment

- cloud storage
  - folder structure
    - project
      - meta.json
      - merge.json      
      - merged.json
      - merge_form.json
      - viz.json
      - .graphml
      - .json
      - .txt
- data store

## Running locally

If you're running the app from a virtual environment don't use `python app.py` unless you specify the python shebang to something other than: `#!/usr/bin/env python`. Preferably use `flask run`.
