

# ------------------------------------------------------------------------------
# load packages
# ------------------------------------------------------------------------------
import re
import json
import random
import string
import pandas as pd
from sklearn.feature_extraction.text import CountVectorizer

import nltk
from nltk import ne_chunk, pos_tag
# https://www.kaggle.com/nltkdata/maxent-ne-chunker/home
# https://www.nltk.org/_modules/nltk/tag.html
# http://web.media.mit.edu/~havasi/MAS.S60/PNLP7.pdf
from nltk.tokenize import word_tokenize, sent_tokenize
from nltk.tree import Tree

# https://stackoverflow.com/questions/34692987/cant-make-stanford-pos-tagger-working-in-nltk
# https://nlp.stanford.edu/software/tagger.html
# http://www.nltk.org/_modules/nltk/tag/stanford.html#CoreNLPPOSTagger
from nltk.tag.stanford import StanfordPOSTagger

path_to_model = "input/stanford/stanford-postagger-full-2018-10-16/models/english-bidirectional-distsim.tagger"
path_to_jar   = "input/stanford/stanford-postagger-full-2018-10-16/stanford-postagger.jar"

standford_tagger = StanfordPOSTagger(path_to_model, path_to_jar)
standford_tagger.java_options = '-mx16384m'          ### Setting higher memory limit for long sentences
standford_tagger.java_options = '-mx16384m'
# https://pythonprogramming.net/named-entity-recognition-stanford-ner-tagger/
from nltk.tag import StanfordNERTagger

path_to_model = "input/stanford/stanford-ner-2014-08-27/classifiers/english.all.3class.distsim.crf.ser.gz"
path_to_jar   = "input/stanford/stanford-ner-2014-08-27/stanford-ner.jar"

standford_ner = StanfordNERTagger(path_to_model, path_to_jar)
standford_ner.java_options = '-mx16384m'          ### Setting higher memory limit for long sentences
standford_ner.java_options = '-mx16384m'



# ------------------------------------------------------------------------------
# functions
# ------------------------------------------------------------------------------
# tokenisation
def tokeniser(text):
    return nltk.word_tokenize(text)


# tagging
def tn_tagger(tokenised_text, tagger='stanford'):
    if tagger == 'nltk':
        return pos_tag(tokenised_text)
    elif tagger == 'stanford':
        return standford_tagger.tag(tokenised_text)

def get_continuous_chunks(chunked):

    # tokenised = word_tokenize(text)
    # tagged = tn_tagger(tokenised,'stanford')
    # chunked = ne_chunk(tagged)
    prev = None
    prev_tag = None
    prev_label = None
    continuous_chunk = []
    all_chunks = []
    current_chunk = []
    for i in chunked:
        if type(i) == Tree:
            # print(i,'tree')
            # print(i.leaves())
            if prev_label == i.label() or prev_label == None:
                # print('current')
                current_chunk.append(" ".join([token for token, pos in i.leaves()]))
            else:
                # print('break')
                named_entity = " ".join(current_chunk)
                named_entity.strip()
                all_chunks.append((named_entity, prev_tag))
                current_chunk = []
                current_chunk.append(" ".join([token for token, pos in i.leaves()]))
            prev_tag = i.leaves()[0][1]
            prev_label = i.label()
        elif current_chunk:
            # print(i,'not tree')
            named_entity = " ".join(current_chunk)
            all_chunks.append((named_entity, prev_tag))
            all_chunks.append(i)
            current_chunk = []
            if named_entity not in continuous_chunk:
                continuous_chunk.append(named_entity)
        else:
            # print(i,'something else')
            all_chunks.append(i)
            continue
    return all_chunks

def IOB_to_tree(iob_tagged):
    # https://stackoverflow.com/questions/27629130/chunking-stanford-named-entity-recognizer-ner-outputs-from-nltk-format
    # https://stackoverflow.com/questions/30664677/extract-list-of-persons-and-organizations-using-stanford-ner-tagger-in-nltk
    root = Tree('S', [])
    for token in iob_tagged:
        if token[2] == 'O':
            root.append((token[0], token[1]))
        else:
            try:
                if root[-1].label() == token[2]:
                    root[-1].append((token[0], token[1]))
                else:
                    root.append(Tree(token[2], [(token[0], token[1])]))
            except:
                root.append(Tree(token[2], [(token[0], token[1])]))

    return root

def chunks_by_sentence(sentences,tagger='stanford'):
    all_chunks = []
    if tagger == 'stanford':
        words = [word_tokenize(sentence) for sentence in sentences]

        tagged_list = standford_tagger.tag_sents(words)

        ner_list = standford_ner.tag_sents(words)

        ner_pos_list = [[(w[0],w[1],ner_list[jdx][idx][1]) for idx,w in enumerate(tps)] for jdx,tps in enumerate(tagged_list)]

        tagged_tree_list = [IOB_to_tree(i) for i in ner_pos_list]

        for chunked in tagged_tree_list:
            all_chunks += get_continuous_chunks(chunked)
        return all_chunks

    elif tagger == 'nltk':
        for sentence in sentences:
            tokenised = word_tokenize(sentence)
            tagged = pos_tag(tokenised)
            chunked = ne_chunk(tagged)
            all_chunks += get_continuous_chunks(chunked)
        return all_chunks

def tag_sentences(text,tagger='stanford', filter=None):
    # https://textminingonline.com/dive-into-nltk-part-ii-sentence-tokenize-and-word-tokenize
    # taggs tokenised list
    # print(text)
    sentences = sent_tokenize(text)
    # print(sentences)
    # stanfrod POS takes quite a while to run
    #  thus the stanford option should only be availble for looged in users
    tagged = chunks_by_sentence(sentences,tagger)
    # print(tagged)

    if filter is not None:
        tagged = [elem for elem in tagged if elem[1].lower() in [filter, filter+'s']]

    tokens = [elem[0] for elem in tagged]
    # if string is punctuation set tag to PUNCT
    regex = re.compile('[%s]' % re.escape(string.punctuation+'—'))
    tagged = {elem[0]:'PUNCT' if (regex.match(elem[0]) or (len(elem[0]) == 0)) else elem[1] for elem in tagged}

    return tokens,tagged

def document_term_matrix(corpus):

    vector = CountVectorizer()
    spare_corpus = vector.fit_transform(corpus)
    dtm = pd.DataFrame(spare_corpus.toarray(), columns=vector.get_feature_names())

    return dtm
