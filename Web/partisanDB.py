import couchdb2
#https://gist.github.com/marians/8e41fc817f04de7c4a70
from datetime import datetime, date
from collections import defaultdict, OrderedDict
import pytz

class PartisanDB:

    def __init__(self, user="admin", pw="Welcome123", path="127.0.0.1:5984"):
        self.user = "admin"
        self.pw = "Welcome123"
        self.couchserver = couchdb2.Server("http://%s:%s@%s/" % (user, pw, path))
        self.timezone = pytz.timezone('Australia/Melbourne')

        #partisan_scores is the name of our db
        self.db_name = "partisan_scores"
        if self.db_name in self.couchserver:
            db = self.couchserver[self.db_name]
        else:
            db = self.couchserver.create(self.db_name)
        self.db = db

    def add_document(self, id, history, curr_score, top_three, top_three_veracity):
        """
        id - refers to unique browser fingerprint
        history - refers to only website visit data that has a partisan value tied to it
        curr_score - refers to the calculation as a result of history
        """
        datetime.now(self.timezone)
        document = {'userid':id,'date':datetime.now().strftime("%d %m %Y %H:%M:%S"), 'hist':history, 'score':curr_score, 'top three':top_three, 'top three veracity':top_three_veracity}
        self.db.put(document)

    def generate_history_user(self, input_id):
        """
        This will generate every timestamped entry
        TODO: Check if insufficient entries
        """
        userDict = defaultdict(list)
        for id in self.db:
           for k,v in id.items():
               if k=='userid' and v==input_id:
                   userDict[v].append(id)
        return userDict[input_id]

    def filter_history_user(self, input_id):
        user_history = self.generate_history_user(input_id)
        if len(user_history) < 5:
            return '"Insufficient Length"'
        else:
            #Here we need to verify that the gap between each item is at least three days
            #it's the 3rd array item which corresponds to date
            dates = self.date_extract(user_history)
            filtered_dates = self.date_filter(dates)
            filtered_history = self.history_filter(dates, user_history)
            return filtered_history


    #returns an array of dates from earliest to most recent.
    #Alongside a corresponding array position for userDict
    def date_extract(self, user_history):
        date_array = []
        for i in range(0,len(user_history)):
            curr_date = list(user_history[i].items())[3][1].split(" ")
            curr_time = curr_date[3].split(':')
            curr_date_new = datetime(int(curr_date[2]), int(curr_date[1]), int(curr_date[0]), int(curr_time[0]), int(curr_time[1]))
            date_array.append((curr_date_new,i))
        return sorted(date_array)

    def date_filter(self, dates):
        for item in dates:
            for item2 in dates:
                if(item[0] == item2[0]):
                    pass
                elif abs((item[0] - item2[0]).days) < 3:
                    try:
                        dates.remove(item2[0])
                    except:
                        pass
        return dates

    def history_filter(self, dates, user_history):
        filtered_history = []
        for entry in dates:

            hist = user_history[entry[1]]
            relevant_hist = "{" + "\"date\"" + ":" + str(hist['date']) + ",\"score\":" + str(hist['score']) + ",\"topthree\":" + str(hist['top three']) + ",\"topthreeveracity\":" + str(hist['top three veracity']) + "}"
            relevant_hist = relevant_hist.replace("'", "\"")
            filtered_history.append(relevant_hist)

        return filtered_history



"""
TODO: Generates history of all users
import couchdb2
from collections import defaultdict, OrderedDict
from datetime import datetime
user="admin"
pw='Welcome123'
path="127.0.0.1:5984"
couchserver = couchdb2.Server("http://%s:%s@%s/" % (user, pw, path))
db_name = "partisan_scores"
db = couchserver[db_name]
userDict = defaultdict(list)
input_id="eagle-848c27680ceeb864b34c0952b60187b5c84bcb392efefdcbdd8225c7ca9ccf"

for id in db:
  for k,v in id.items():
      if (k=='userid' and v==input_id):
          userDict[v].append(id)

user_history = userDict[input_id]
date_array = []
for i in range(0,len(user_history)):
    curr_date = user_history[i].items()[3][1].split(" ")
    curr_time = curr_date[3].split(':')
    print(int(curr_date[2]), int(curr_date[1]), int(curr_date[0]), int(curr_time[0]), int(curr_time[1]))
    curr_date_new = datetime(int(curr_date[2]), int(curr_date[1]), int(curr_date[0]), int(curr_time[0]), int(curr_time[1]))
    date_array.append((curr_date_new,i))

dates = date_array
for item in dates:
    for item2 in dates:
        if(item[0] == item2[0]):
            pass
        elif abs((item[0] - item2[0]).days) < 3:
            try:
                dates.remove(item2[0])
            except:
                pass

filtered_history = []
for entry in dates:
    hist = user_history[entry[1]]
    relevant_hist = '{ date: ' + str(hist['date']) + ', score: ' + str(hist['score']) +', top three: ' + str(hist['top three']) + ', top three veracity: ' + str(hist['top three veracity']) + '}'
    print(relevant_hist)
    filtered_history.append(relevant_hist)
"""
