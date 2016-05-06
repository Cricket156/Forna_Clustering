# Data handling
import pandas as pd
import numpy as np

# Outlier detection
from sklearn import svm

# Clustering
# Kmeans
from sklearn.cluster import KMeans
#DBScan
from sklearn.cluster import DBSCAN
from sklearn import metrics

#uebergabeparameter von website
?

# dataframe slicing
friction = 'fiction'
middleCh = 'middleCharge'
otherCh = 'otherCharge'
num_links = 'AnzahlLinks'
overlaps = 'overlaps'
stretches = 'stretches'
position = 'position'


selectionlist = []
selectionlist.extend((overlaps, stretches, position))
print(selectionlist)

# DBSCAN parameters
epsparam = 0.3
min_samplesparam = 10



# read data,
df1=pd.read_table('penalty_3.csv', sep=';',header=0)
X = df1.ix[:,selectionlist]

print(X)


##################################################3
#
# Outlier detection
#
##################################################

db = DBSCAN(eps=epsparam, min_samples=min_samplesparam).fit(X)

core_samples_mask = np.zeros_like(db.labels_, dtype=bool)
core_samples_mask[db.core_sample_indices_] = True
labels = db.labels_


###############################################
#
# SVM - can also be used to check for linear seperability when taking a linear svb kernel
#
###########################################
