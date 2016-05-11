# Data handling
import pandas as pd
import numpy as np
# filehandling
import os
# Outlier detection
from sklearn import svm
# Clustering
#DBScan
from sklearn.cluster import DBSCAN
from sklearn import metrics
path = "/home/trummelbummel/Desktop/github/Forna_Clustering/clustering"

#uebergabeparameter von website


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

# DBSCAN parameters
epsparam = 0.3
min_samplesparam = 3

# read data,
df1=pd.read_table('penalty_3.csv', sep=';',header=0)
# all headers
colnames = list(df1.columns.values)
# slice data
X=df1.ix[:,selectionlist]
# rest indizes
colnamesrest = [x for x in colnames if x not in selectionlist]
Rest = df1.ix[:, colnamesrest]

##################################################3
#
# Clustering
#
##################################################

# dbscan using parameters given epsparameter is raidus, min sample is minimum points in a cluster
db = DBSCAN(eps=epsparam, min_samples=min_samplesparam).fit(X)
# extract clusterlabels and outliers
core_samples = db.core_sample_indices_
# define a boolean mask so we can plot the core, boundary, and noise points separately
core_samples_mask = np.zeros_like(db.labels_, dtype=bool)
core_samples_mask[db.core_sample_indices_] = True
labels = db.labels_
n_clusters_ = len(set(labels)) - (1 if -1 in labels else 0)

# returns clusters and outliers as lists
clusters = [X[labels == i] for i in xrange(n_clusters_)]
outliers = [X[labels == -1]]

# after clustering original indizes are still maintained
# print("clusters start here")
# print(clusters)
# print('outliers start here')
# print(outliers)
#
# gives each cluster a running index
def mergeDF(clusters, Rest):
    dfoutlist = []
    for i in range(len(clusters)):
        dfout = pd.merge(clusters[i], Rest, how='outer', left_index = True, right_index =True)
        dfoutnew = dfout.dropna()
        dfoutnew.insert(0, 'innumcluster', [int(i)]*(len(dfoutnew)))
        dfoutlist.append(dfoutnew)
    return dfoutlist

#outliers will be -1 index (i.e. -1 cluster)
def mergeoutliersDF(outliers, Rest):
    dfoutlist = []
    for i in outliers:
        dfout = pd.merge(i, Rest, how='outer', left_index = True, right_index =True)
        dfoutnew = dfout.dropna()
        dfoutnew.insert(0, 'innumcluster', [-1]*(len(dfoutnew)))
        dfoutlist.append(dfoutnew)
    return dfoutlist


clusterdataframes = mergeDF(clusters, Rest)
outlierdataframe = mergeoutliersDF(outliers, Rest)
output = clusterdataframes + outlierdataframe
clusterdataframes.append(outlierdataframe)
framelist = [pd.DataFrame(x) for x in output]

dftotaloutput = pd.concat(framelist)
print(dftotaloutput)


# save to csv
dftotaloutput.to_csv(path + "/results.csv")
