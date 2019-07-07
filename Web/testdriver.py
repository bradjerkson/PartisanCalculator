import sys
from analysis import *

def main(label, history):
    #stuff
    model = PartisanModel(label, history)
    model.run()
    return str(model.score)

if __name__ == "__main__":
	main(sys.argv[1],sys.argv[2])