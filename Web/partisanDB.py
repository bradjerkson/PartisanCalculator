import couchdb2
#https://gist.github.com/marians/8e41fc817f04de7c4a70
from datetime import datetime
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

   def add_document(self, id, history, curr_score):
      """
      id - refers to unique browser fingerprint
      history - refers to only website visit data that has a partisan value tied to it
      curr_score - refers to the calculation as a result of history
      """
      datetime.now(self.timezone)
      document = {'userid':id,'date':datetime.now().strftime("%d %m %Y %H:%M:%S"), 'hist':history, 'score':curr_score}
      self.db.put(document)

   def generate_history(self):
      """
      TODO: Generates history of all users
      """

   def generate_history_user(self, id):
      """
      TODO: Generates history of specific user
      """

   