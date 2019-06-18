import json
import sklearn
import pandas as pd
import sys

from collections import Counter
from sklearn.naive_bayes import GaussianNB

scoring = {
    'extreme_right':3,
    'right':2,
    'right-center':1,
    #center will move person 1 point towards 0
    'center':0,
    'left-center':-1,
    'left':-2,
    'extreme_left':-3
}

def full_view(df):
    #here we print out every result when printing dataframes
    pd.set_option('display.max_colwidth', -1)
    pd.set_option('display.max_rows', len(df))
    #print(df)

def load_instance(filename):
    with open(filename) as inputfile:
        data = json.load(inputfile)

    counts = (Counter(data["urls"]))
    df = pd.DataFrame.from_dict(counts, orient='index').reset_index()
    df['index'] = df['index'].str.replace('www[23]?.', '', case=False)
    return df.sort_values(0, ascending=False)


def generate_user_media_history(df, counts):
    out = counts[counts['index'].isin(df['source_url_processed'])]
    df_out = df.loc[df['source_url_processed'].isin(out['index'])]
    final_out = pd.merge(out, df_out, left_on=['index'], right_on=['source_url_processed'])
    return final_out

def simple_classifier(history, scoring):
    scores = history.apply(lambda x: (x[0]) * scoring[x['bias']], axis=1)

    #handle the zeroes
    zeroes = scores[scores == 0].shape[0]
    
    #tf-idf?
    score = (scores.sum() - zeroes) if scores.sum() > 0 else (scores.sum() + zeroes)
    return score / len(history)

def main(input_history):
    df = pd.read_csv("newsmedia.csv", header=0)
    counts = load_instance(input_history)
    full_view(df)
    history = generate_user_media_history(df, counts)
    score = simple_classifier(history, scoring)
    print(score)

if __name__ == "__main__":
	main(sys.argv[1])