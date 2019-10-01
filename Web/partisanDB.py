import couchdb


class PartisanDB:
user = "admin"
pw = "Welcome123"
couchserver = couchdb.Server("http://%s:%s@127.0.0.1:5984/" % (user, pw))

#partisan_scores is the name of our db
dbname = "partisan_scores"
if dbname in couchserver:
   db = couchserver[dbname]
else:
   db = couchserver.create(dbname)



