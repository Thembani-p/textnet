FROM ubuntu:16.04

# MAINTANER Your Name "thembani@live.co.za"

# install python
RUN apt-get update -y && \
    apt-get install -y python3-pip python3-dev build-essential

# setup add-apt-repository
RUN apt-get install -y software-properties-common

# setup igraph
#RUN add-apt-repository ppa:igraph/ppa
#RUN apt-get update
RUN apt-get install -y libxml2 libxml2-dev libxslt-dev libc-dev \
  libffi-dev zlib1g zlib1g-dev libtool libcairo2-dev
RUN apt-get install -y python-igraph

# We copy just the requirements.txt first to leverage Docker cache
COPY ./requirements.txt /app/requirements.txt
COPY ./<google-service-account.json> /app/<google-service-account.json>

ENV APP_HOME /app
WORKDIR $APP_HOME

RUN pip3 install -r requirements.txt
RUN python3 -m nltk.downloader punkt -d /usr/nltk_data
RUN python3 -m nltk.downloader averaged_perceptron_tagger -d /usr/nltk_data
RUN python3 -m nltk.downloader maxent_treebank_pos_tagger -d /usr/nltk_data
ENV GCS=True
ENV GOOGLE_APPLICATION_CREDENTIALS=<google-service-account.json>

# install java / the old way
#RUN add-apt-repository ppa:webupd8team/java
#RUN apt-get update && apt-get install oracle-java8-installer
#RUN javac -version
#RUN apt install openjdk-8-jdk-headless

# install java / the new way
#RUN echo "deb http://ppa.launchpad.net/webupd8team/java/ubuntu xenial main" | tee /etc/apt/sources.list.d/webupd8team-java.list
#RUN echo "deb-src http://ppa.launchpad.net/webupd8team/java/ubuntu xenial main" | tee -a /etc/apt/sources.list.d/webupd8team-java.list
#RUN apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys EEA14886
#RUN apt-get update
#RUN apt-get install oracle-java8-installer

# install java
RUN apt-get install -y openjdk-8-jdk
RUN apt-get install tree


COPY textnet/ ./textnet/
COPY input/ ./input/
COPY app.py ./

RUN ls -l
RUN ls -l textnet
RUN tree input

CMD exec gunicorn --bind 0.0.0.0:$PORT --workers 1 --threads 8 app:app
