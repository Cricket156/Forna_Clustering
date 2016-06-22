#!/usr/bin/python
import argparse
# Data handling
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import timeit
# filehandling
import os
import csv
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
# normalizing
from sklearn import preprocessing
from sklearn.preprocessing import FunctionTransformer
from scipy import stats
# 3D plot
# import mpl_toolkits.mplot3d.axes3d as p3
# # parameter passing from web
# argument parser
start = timeit.timeit()

parser = argparse.ArgumentParser()
parser.add_argument('-l','--list', nargs='+', help='<Required> Set flag', required=True)
args = parser.parse_args()

print(args.list)

cwd = os.getcwd()
pathtosave = cwd + "/resultsclustering"

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
Xpre=df1.ix[:,selectionlist]

# rest indizes
colnamesrest = [x for x in colnames if x not in selectionlist]
Restpre = df1.ix[:, colnamesrest]
# extract columns with stringvalues "^" mathes the beginning of any string
collocations = pd.Series(Restpre.loc[2].str.contains(r"^", na=False)).tolist()

seqs = Restpre.ix[:,collocations]
seqcols = seqs.columns.values
Restpre.drop(Restpre.ix[:,seqcols], axis=1, inplace=True)
Rest = Restpre

# standardization of the data we cluster over
scaler = preprocessing.StandardScaler().fit(Xpre)
X_scaled = scaler.transform(Xpre)
# sqrt transform the heavily skewed data
# transformer = FunctionTransformer(np.sqrt)
# Xtran = transformer.transform(X_scaled)

X = pd.DataFrame(X_scaled)
selectionheaders = selectionlist
oldnames = X.columns.values

# rename all columns with original columnheaders
X.rename(columns=dict(zip(oldnames, selectionheaders)), inplace=True)

# scale rest
# standardization of the data we cluster over
scaler = preprocessing.StandardScaler().fit(Restpre)
Rest_scaled = scaler.transform(Restpre)
# log transform the heavily skewed data
# transformer = FunctionTransformer(np.sqrt)
# Xtran = transformer.transform(X_scaled)
Rest = pd.DataFrame(Rest_scaled)
oldnames = pd.Series(Restpre.columns.values)
# rename all columns with original columnheaders
Rest.rename(columns=oldnames, inplace=True)
# removes variables that are not needed for vis
# listtoremovenames = Rest.columns.values.tolist()
listtoremove = [1,2,3,4,5,6,9,10,11,12,13,14]
Rest = Rest.drop(Rest.columns[listtoremove], axis=1)

# # #plot 3by3 scatterplotmatrix
# from pandas.tools.plotting import scatter_matrix
# scatter_matrix(X, alpha=0.2, figsize=(3, 3))
# plt.show()

# # look at skewness of the data
# Punpaired = preprocessing.scale(np.sqrt(X['Punpaired']))
# PunpairedOrig = preprocessing.scale(X['Punpaired'])
#
# #Next We calculate Skewness using skew in spicy.stats
# skness = skew(Punpaired)
# sknessOrig = skew(PunpairedOrig)
# #We draw the histograms
# figure = plt.figure()
# figure.add_subplot(131)
# plt.hist(Punpaired,facecolor='red',alpha=0.75)
# plt.xlabel("Punpaired - Transformed(Using Sqrt)")
# plt.title("Transformed Punpaired Histogram")
# plt.text(2,100000,"Skewness: {0:.2f}".format(skness))
#
# figure.add_subplot(132)
# plt.hist(PunpairedOrig,facecolor='blue',alpha=0.75)
# plt.xlabel("Punpaired - Based on Original Flight Times")
# plt.title("Punpaired Histogram - Right Skewed")
# plt.text(2,100000,"Skewness: {0:.2f}".format(sknessOrig))
# figure.add_subplot(133)
# plt.boxplot(AirTime)
# plt.title("Un-Skewed Distribution")
# plt.show()

##################################################3
#
# Parameter estimation
#
##################################################

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

numberofdatapoints = len(df1)
numtry = 10
epsparam = eps
min_samplesparam = 3
# creates an array for clustersim
minptsarray = np.arange(min_samplesparam, 30, 2)


# # as an example plot the histogram

epsforsim = epsparam



##################################################3
#
# Clustering
#
##################################################



def clustersim(X, epsforsim, minptsarray, silhouettelist=[], clusterlist=[], outlierlist=[]):
    for i in xrange(0,len(minptsarray)):
    # dbscan using parameters given epsparameter is raidus, min sample is minimum points in a cluster
        db = DBSCAN(eps=epsforsim, min_samples=minptsarray[i]).fit(X)
    # extract clusterlabels and outliers
        core_samples = db.core_sample_indices_
    # define a boolean mask so we can plot the core, boundary, and noise points separately
        core_samples_mask = np.zeros_like(db.labels_, dtype=bool)
        core_samples_mask[db.core_sample_indices_] = True
        labels = db.labels_
        n_clusters_ = len(set(labels)) - (1 if -1 in labels else 0)
        silhouettelist.append([metrics.silhouette_score(X,labels), epsforsim ,minptsarray[i], n_clusters_,"results"+str(i)+".csv"])
        clusters = [X[labels == i] for i in xrange(n_clusters_)]
        clusterlist.append(clusters)
        outliers = [X[labels == -1]]
        outlierlist.append(outliers)
    return clusterlist, outlierlist, silhouettelist

# visualize heuristic for choosing eps
# plt.hist(distances, bins=np.arange(0,3, stepsize))
# plt.xlabel('Distances')
# plt.ylabel('Frequency')
# plt.show()

# visualize data distributions
# # 2D plot using overlaps and stretches on x and y axis
# plt.scatter(X.iloc[:, 0], X.iloc[:, 1], c=labels)
# plt.title("DBScan Clustering")
# plt.show()




# #####################################################
#
# Output
#
#
#################################################################
# gives each cluster a running index
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
        dfout = pd.merge(i, Rest, how='outer', left_index = True, right_index=True)
        dfoutnew = dfout.dropna()
        dfoutnew.insert(0, 'innumcluster', [-1]*(len(dfoutnew)))
        dfoutlist.append(dfoutnew)
    return dfoutlist

# store simulation results in file for scatterplot
def clustersimqualityresultstofile(pathtosave, silhouettelist):
    filename = 'clusteringsim.csv'
    csv_output = open(filename, 'wb')
    listout = silhouettelist
    header = ["silhouette", "eps", "minpts", "numberofclusters", "file"]
    csv_writer = csv.writer(csv_output)
    csv_writer.writerow(header)
    for item in listout:
        csv_writer.writerow(item)
    csv_output.close()

# store results of clustering in seperate files for general visualization
def clustersimresultstofile(pathtosave, clusterlist, outlierlist, Rest):
    for i in xrange(0, (len(clusterlist)-1)):
        filename = os.path.join(pathtosave, "results"+str(i)+".csv")
        clusterdataframe = mergeDF(clusterlist[i], Rest)
        outlierdataframe = mergeoutliersDF(outlierlist[i], Rest)
        output = clusterdataframe + outlierdataframe
        clusterdataframe.append(outlierdataframe)
        framelist = [pd.DataFrame(x) for x in output]
        dftotaloutput = pd.concat(framelist)
        dftotaloutput['index'] = dftotaloutput.index
        cols = list(dftotaloutput)
        cols.insert(0, cols.pop(cols.index('index')))
        dftotaloutput = dftotaloutput.ix[:, cols]
        dftotaloutput.to_csv(filename, index=False)

# main()
clusterlist, outlierlist, silhouettelist = clustersim(X, epsforsim, minptsarray)
print("simulating clustering...")
clustersimresultstofile(pathtosave, clusterlist, outlierlist, Rest)
print("saving results...")
clustersimqualityresultstofile(pathtosave, silhouettelist)
filename = os.path.join(pathtosave, 'sequences.csv')
seqs['index'] = seqs.index
cols = list(seqs.columns.values)
cols.insert(0, cols.pop(cols.index('index')))
seqs.to_csv(filename, index=True)
end = timeit.timeit()
time = end-start
print("time taken for clustering..")
print(time)
