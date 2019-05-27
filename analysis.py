import json
import sklearn
import pandas as pd

from collections import Counter
from sklearn.naive_bayes import GaussianNB

def load_instance(filename):
    with open(filename) as inputfile:
        data = json.load(inputfile)

    counts = (Counter(data["urls"]))
    df = pd.DataFrame.from_dict(counts, orient='index').reset_index()
    df['index'] = df['index'].str.replace('www[23]?.', '', case=False)
    return df.sort_values(0, ascending=False)


df = pd.read_csv("newsmedia.csv", header=0)
counts = load_instance("sample_input.json")
pd.set_option('display.max_colwidth', -1)
pd.set_option('display.max_rows', len(df))
print(df)

temp = counts.apply(lambda row: row.str.contains("vice.com").any(), axis=1)

#counts2 = counts.apply(lambda row: any(news for news in df['source_url_processed'] if row.str.contains(news).any()), axis=1)
#i want to check whether entries in counts already exist in df
#note that 'in' doesn't pass the check with df strings
