#!/bin/bash

underscore='_'
semicolon=';'
endung='.html'
number=0

rm svg/penalties;

for (( i=0;i<=10;i=$i+2 ));
	do
		friction=$(echo "$i/10" | bc -l);
		for (( j=-30;j<=0;j=$j+6 ));
			do
				for (( k=-30;k<=0;k=$k+6 ));
					do
						for (( l=15;l<=20;l=$l+1 ));
							do
								for (( m=100;m<=120;m=$m+4 ));
									do
										number=$(($number+1));
										sed 's/parameter1/'$friction'/' <index_template.html | sed 's/parameter2/'$j'/' | sed 's/parameter3/'$k'/' | sed 's/parameter4/'$l'/' | sed 's/parameter5/'$m'/' >index.html;
										../node_modules/run-headless-chromium/run-headless-chromium.js index.html --disable-gpu > svg/svg$number$endung
										echo -n $friction$semicolon$j$semicolon$k$semicolon$l$semicolon$m$semicolon >> svg/penalties;
										sed -i /Starting/d svg/svg$number$endung
										sed -i /All/d svg/svg$number$endung
										sed -i /Refused/d svg/svg$number$endung
										./penalties svg/svg$number$endung >> svg/penalties;
									done;
							done;
					done;
			done;
	done;
