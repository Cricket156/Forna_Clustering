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
# slice data
X = df1.ix[:,selectionlist]


##################################################3
#
# Clustering
#
##################################################

db = DBSCAN(eps=epsparam, min_samples=min_samplesparam).fit(X)
core_samples = db.core_sample_indices_
labels = db.labels_
n_clusters_ = len(set(labels)) - (1 if -1 in labels else 0)
print n_clusters_



# returns clusters and outliers as lists
clusters = [X[labels == i] for i in xrange(n_clusters_)]
outliers = X[labels == -1]
print("clusters start here")
print(clusters)
print('outliers start here')
print(outliers)


n_clusters_ = len(set(labels)) - (1 if -1 in labels else 0)
# metrics / quality of clustering etc.
print('Estimated number of clusters: %d' % n_clusters_)
# print("Homogeneity: %0.3f" % metrics.homogeneity_score(labels_true, labels))
# print("Completeness: %0.3f" % metrics.completeness_score(labels_true, labels))
# print("V-measure: %0.3f" % metrics.v_measure_score(labels_true, labels))
# print("Adjusted Rand Index: %0.3f"
#       % metrics.adjusted_rand_score(labels_true, labels))
# print("Adjusted Mutual Information: %0.3f"
#       % metrics.adjusted_mutual_info_score(labels_true, labels))
print("Silhouette Coefficient: %0.3f"
      % metrics.silhouette_score(X, labels))


# Plot result
import matplotlib.pyplot as plt

# Black removed and is used for noise instead.
unique_labels = set(labels)
colors = plt.cm.Spectral(np.linspace(0, 1, len(unique_labels)))
for k, col in zip(unique_labels, colors):
    if k == -1:
        # Black used for noise.
        col = 'k'

    class_member_mask = (labels == k)

    xy = X[class_member_mask & core_samples_mask]
    plt.plot(xy[:, 0], xy[:, 1], 'o', markerfacecolor=col,
             markeredgecolor='k', markersize=14)

    xy = X[class_member_mask & ~core_samples_mask]
    plt.plot(xy[:, 0], xy[:, 1], 'o', markerfacecolor=col,
             markeredgecolor='k', markersize=6)

plt.title('Estimated number of clusters: %d' % n_clusters_)
plt.show()


###############################################
#
# SVM - can also be used to check for linear seperability when taking a linear svb kernel
#
###########################################
