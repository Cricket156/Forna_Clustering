#!/bin/bash

underscore='_'
endung='.png'

for (( i=1;i<=30;i++ ));
	do
		friction=$(echo "$i/30" | bc -l);
		for (( j=-30;j<=0;j++ ));
			do
				for (( k=-30;k<=0;k++ ));
					do
						sed 's/parameter1/'$friction'/' <generator_template.js | sed 's/parameter2/'$j'/' | sed 's/parameter3/'$k'/' | sed 's/parameter4/10/' | sed 's/parameter5/110/' >generator.js;
						phantomjs generator.js > svg/svg$friction$underscore$j$underscore$k$endung;
				done;
		done;
	done;
