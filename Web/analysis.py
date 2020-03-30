import json
import sklearn
import pandas as pd
import sys

from collections import Counter
from sklearn.naive_bayes import GaussianNB
from scipy import stats

class PartisanModel:
    def __init__(self, labels, input_history):
        self.input_history = input_history
        #if input_history is just the filename it is a string type
        #otherwise it'll be dict
        self.input_history_type = type(input_history)
        self.labels = labels
        self.scoring = {
            'extreme_right':3,
            'right':2,
            'right-center':1,
            #center will move person 1 point towards 0
            'center':0,
            'left-center':-1,
            'left':-2,
            'extreme_left':-3
        }
        self.df = None
        self.counts = None
        self.top_three = None
        self.top_three_veracity = None

    def full_view(self, df):
        #here we print out every result when printing dataframes
        pd.set_option('display.max_colwidth', -1)
        pd.set_option('display.max_rows', len(df))
        print(df)

    #we can either load instance via a filename, or a JSON object directly
    def load_instance(self, history, filetype):
        if filetype is str:
            with open(history) as inputfile:
                data = json.load(inputfile)
        else:
           data = self.input_history
        counts = (Counter(data["urls"]))
        df = pd.DataFrame.from_dict(counts, orient='index').reset_index()
        df['index'] = df['index'].str.replace('www[23]?.', '', case=False)
        return df.sort_values(0, ascending=False)


    def generate_user_media_history(self, df, counts):
        out = counts[counts['index'].isin(df['source_url_processed'])]
        df_out = df.loc[df['source_url_processed'].isin(out['index'])]
        final_out = pd.merge(out, df_out, left_on=['index'], right_on=['source_url_processed'])
        return final_out

    def simple_classifier(self, history, scoring):
        scores = history.apply(lambda x: (x[0]) * scoring[x['bias']], axis=1)

        #handle the zeroes
        zeroes = scores[scores == 0].shape[0]
        #tf-idf?
        score = (scores.sum() - zeroes) if scores.sum() > 0 else (scores.sum() + zeroes)
        print("your actual score is: ", score)

        return score / len(history)

    def z_score_classifier(self, history, state):
        #State needs to be obtained from
        print("Not ready yet")

    def generate_fave_site(self, history, counts):
        #This generates the user's top 3 news sites
        top_three = self.history['index'][0:3]
        output = [top_three[0], top_three[1], top_three[2]]
        return output

    def fave_sites_veracity(self, history):
        output = []
        for site in self.top_three:
            site_info = history.loc[history['index'] == site]
            output.append(site_info['fact'].values[0])
        print(output)
        return output


    def run(self):
        self.df = pd.read_csv(self.labels, header=0)
        self.counts = self.load_instance(self.input_history, self.input_history_type)
        self.history = self.generate_user_media_history(self.df, self.counts)
        print("History: ", self.history)
        #We need to pull the plug here, upon failure.
        if self.history.empty:
            print("Sorry, your browsing history has insufficient data. Keep on browsing!")
            self.score = None
        else:
            self.score = self.simple_classifier(self.history, self.scoring)
            print(self.score)

        self.top_three = self.generate_fave_site(self.history, self.counts)
        self.top_three_veracity = self.fave_sites_veracity(self.history)
