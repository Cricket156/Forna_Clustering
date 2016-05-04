#!/bin/bash

underscore='_'
semicolon=';'
endung='.png'
number=0

rm svg/penalties;

for (( i=1;i<=30;i++ ));
	do
		friction=$(echo "$i/30" | bc -l);
		for (( j=-30;j<=0;j++ ));
			do
				for (( k=-30;k<=0;k++ ));
					do
						number=$(($number+1));
						sed 's/parameter1/'$friction'/' <generator_template.js | sed 's/parameter2/'$j'/' | sed 's/parameter3/'$k'/' | sed 's/parameter4/10/' | sed 's/parameter5/110/' >generator.js;
						phantomjs generator.js > svg/svg$number$endung;
						echo -n $friction$semicolon$j$semicolon$k$semicolon >> svg/penalties;
						./penalties svg/svg$number$endung >> svg/penalties;
					done;
			done;
	done;
