#!/usr/bin/python

import argparse
# Data handling
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
# filehandling
import os
# Outlier detection
from sklearn import svm
from sklearn.neighbors import NearestNeighbors
# Clustering
#DBScan
from sklearn.cluster import DBSCAN
from sklearn import metrics
# hierachical clustering
from sklearn.neighbors import kneighbors_graph
from sklearn.cluster import AgglomerativeClustering
# 3D plot
# import mpl_toolkits.mplot3d.axes3d as p3
# # parameter passing from web
# argument parser
parser = argparse.ArgumentParser()
parser.add_argument('-l','--list', nargs='+', help='<Required> Set flag', required=True)
args = parser.parse_args()

print(args.list)

#
# dataframe slicing
# selectionlist gets passed the parameterlist from json object
selectionlist = []
selectionlist.extend((args.list))

# read data,
df1=pd.read_table('penalties.csv', sep=';',header=0)

# all headers
colnames = list(df1.columns.values)
# slice data
X=df1.ix[:,selectionlist]
# rest indizes
colnamesrest = [x for x in colnames if x not in selectionlist]
Rest = df1.ix[:, colnamesrest]

# #plot 3by3 scatterplotmatrix
# from pandas.tools.plotting import scatter_matrix
# scatter_matrix(X, alpha=0.2, figsize=(3, 3))
# plt.show()
# print(Rest)
# ##################################################3
# #
# # Parameter estimation
# #
# ##################################################

# DBSCAN parameters
# look for at the distance distribution of dataset which only contains the
# parameters we actually cluster over i.e. the penalties and set eps
# to be a sensible value based on this analysis. For eps to be appropriate
# we should pick a value for the distance of all points to its nearest neighbors
# that includes most of the dataset such that one has a small number of outliers.

neighbors = NearestNeighbors(n_neighbors=2, algorithm='ball_tree').fit(X)
distances, indices = neighbors.kneighbors(X)
stepsize = 0.1
histo = np.histogram(distances, bins=np.arange(0, 10, stepsize))
# cutoff in percent
cutoff = 1
# look if change greater some percent value cutoff
def percentagechange(histogram):
    percentchange = []
    cumsum = np.cumsum(histo[0])
    sumtotal = cumsum[-1]
    for i in range(len(histogram)):
        change = abs((float(histogram[i-1] - histogram[i]) /float(sumtotal)) * 100)
        percentchange.append(change)
    return percentchange

# looks if cutoff smaller
def geteps(percentchange, cutoff):
    for i in range(len(percentchange)):
        if percentchange[i] < cutoff:
            return i

percentchange = percentagechange(histo[0])

eps = stepsize*geteps(percentchange, cutoff)

epsparam = eps

min_samplesparam = 3
#
# # as an example plot the histogram

# plt.hist(distances, bins=np.arange(0,3, stepsize))
# plt.xlabel('Distances')
# plt.ylabel('Frequency')
# plt.show()

# ##################################################3
# #
# # Clustering
# #
# ##################################################

# dbscan using parameters given epsparameter is raidus, min sample is minimum points in a cluster
db = DBSCAN(eps=epsparam, min_samples=min_samplesparam).fit(X)
# extract clusterlabels and outliers
core_samples = db.core_sample_indices_
# define a boolean mask so we can plot the core, boundary, and noise points separately
core_samples_mask = np.zeros_like(db.labels_, dtype=bool)
core_samples_mask[db.core_sample_indices_] = True
labels = db.labels_
n_clusters_ = len(set(labels)) - (1 if -1 in labels else 0)


print("Silhouette Coefficient: %0.3f"
      % metrics.silhouette_score(X, labels))

# # 2D plot using overlaps and stretches on x and y axis
# plt.scatter(X.iloc[:, 0], X.iloc[:, 1], c=labels)
# plt.title("DBScan Clustering")
# plt.show()

# returns clusters and outliers as lists
clusters = [X[labels == i] for i in xrange(n_clusters_)]
outliers = [X[labels == -1]]

################################################
#
#
# Hierachical clustering - Test
#
##################################################
# Define the structure A of the data. Here a 10 nearest neighbors
# connectivity = kneighbors_graph(X, n_neighbors=3, include_self=False)
#
# ward = AgglomerativeClustering(n_clusters=2, connectivity=connectivity,
#                                 linkage='ward').fit(X)
#
# label = ward.labels_
#
# print("Silhouette Coefficient: %0.3f"
#       % metrics.silhouette_score(X, label))
#
#
# plt.scatter(X.iloc[:, 0], X.iloc[:, 1], c=label)
# plt.title("Hierachical Clustering")
# plt.show()



# #####################################################
#
# Output
#
#
#################################################################
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
# name index column and move it to the front
dftotaloutput['index'] = dftotaloutput.index
cols = list(dftotaloutput)
cols.insert(0, cols.pop(cols.index('index')))
dftotaloutput = dftotaloutput.ix[:, cols]

# save to csv
dftotaloutput.to_csv("results.csv", index=False)
