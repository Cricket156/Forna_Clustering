#include "Penalties.h"
#include <cstdlib>
#include <iostream>
#include <vector>
#include <cstring>
#include <string>

using namespace std;
using namespace pugi;

int getPositionPenalty(vector<Line>*,double,double,double,double);

int main(int argc, const char* argv[])
{
	const char* xml_file;
	vector<Line> lines;
	double translate_x=0;
	double translate_y=0;
	double scale_x=1;
	double scale_y=1;
	
	if (argc>1)
		xml_file=argv[1];
	else
		xml_file="example.xml";

	xml_document doc;

	if (!doc.load_file(xml_file))
	{
		cout << "Could not find xml file!" << endl;
		return 0;
	}

	xml_node svg_xml = doc.child("svg");

	if (!svg_xml)
	{
		cout << "No svg specified in xml" << endl;
		return 0;
	}

	xml_node g_xml = svg_xml.child("g");

	if (g_xml)
        {
		g_xml = g_xml.child("g");

		if (g_xml)
		{
			g_xml = g_xml.next_sibling();

			string transform = g_xml.attribute("transform").value();

			string translate;
			unsigned tr_index=transform.find("translate(");
			
			if(tr_index!=string::npos)
			{
				unsigned end_index=transform.find(")",tr_index+1);

				if(end_index!=string::npos)
				{
					translate=transform.substr(tr_index+10,end_index-(tr_index+10));
					
					unsigned comma_index=translate.find(",");

					if(comma_index!=string::npos)
					{
						translate_x=strtod((translate.substr(0,comma_index-1)).c_str(),NULL);
						translate_y=strtod((translate.substr(comma_index+1)).c_str(),NULL);
					}

				}
				else
				{
					cout << "Fehler bei Einlesen der Transformation!" << endl;
					return 0;
				}
			}


			string scale;
                        unsigned sc_index=transform.find("scale(");

                        if(sc_index!=string::npos)
                        {
                                unsigned end_index=transform.find(")",sc_index+1);

                                if(end_index!=string::npos)
                                {
                                        scale=transform.substr(sc_index+6,end_index-(sc_index+6));

                                        unsigned comma_index=scale.find(",");

                                        if(comma_index!=string::npos)
                                        {
                                                scale_x=strtod((scale.substr(0,comma_index-1)).c_str(),NULL);
                                                scale_y=strtod((scale.substr(comma_index+1)).c_str(),NULL);
	                                }

                                }
                                else
                                {
                                        cout << "Fehler bei Einlesen der Transformation!" << endl;
                                        return 0;
                                }
			}

			if (g_xml)
				g_xml = g_xml.child("g");
		}
        }

	if (!g_xml)
        {
		cout << "Fehler beim Einlesen der Daten (falsche Struktur)!" << endl;
                return 0;
        }

	for (xml_node line_xml=g_xml.first_child(); line_xml; line_xml=line_xml.next_sibling())	
	{
		double x1 = line_xml.attribute("x1").as_double();
		double y1 = line_xml.attribute("y1").as_double();
		double x2 = line_xml.attribute("x2").as_double();
		double y2 = line_xml.attribute("y2").as_double();
		int type = BASEPAIR;

		if(strcmp("backbone",line_xml.attribute("link_type").value()))
			type = BACKBONE;

		lines.resize(lines.size()+1);
		lines[lines.size()-1]=Line(x1,y1,x2,y2,type);
	}

	cout << "Anzahl lines: " << lines.size() << endl;	

	//TODO sehr große Toleranz??
	unsigned overlaps=0;
	//unsigned helix=0;
	//TODO wie wird ideal Laenge berechnet??
	//double average_length=0;
	double min_length=lines[0].getLength();
	unsigned stretches=0;

	for(unsigned i=0;i<lines.size();++i)
		for(unsigned j=i+1;j<lines.size();++j)
			if(lines[i].intersect(lines[j]))
			{
				//if(lines[i].getType()==BACKBONE && lines[j].getType()==BACKBONE)
				//	++helix;
				//else
					++overlaps;
			}

	cout << "Overlaps: " << overlaps << endl;
	//cout << "Helix: " << helix << endl;	

	for(unsigned i=1;i<lines.size();++i)
		if(lines[i].getLength()<min_length)
			min_length=lines[i].getLength();
			
		//average_length+=lines[i].getLength();

	//average_length/=lines.size();

	//cout << "Durchschnittliche Laenge: " << average_length << endl;
	//cout << "Kleinste Laenge: " << min_length << endl;

	for(unsigned i=0;i<lines.size();++i)
		if(lines[i].getLength()>3*min_length)
			++stretches;

	cout << "Stretches: " << stretches << endl;

	//TODO Position

	double position = getPositionPenalty(&lines,translate_x,translate_y,scale_x,scale_y);

	cout << "PositionPenalty:" << position << endl;

	return 0;
}

int getPositionPenalty(vector<Line>* p_lines,double translate_x,double translate_y,double scale_x,double scale_y)
{
	double min_x=250,min_y=250,max_x=250,max_y=250;

	for(vector<Line>::iterator it=p_lines->begin();it!=p_lines->end();it++)
	{
		double x1=(*it).getX1();
		double x2=(*it).getX2();
		double y1=(*it).getY1();
		double y2=(*it).getY2();

		x1*=scale_x;
                x2*=scale_x;
                y1*=scale_y;
                y2*=scale_y;

		x1+=translate_x;
		x2+=translate_x;
		y1+=translate_y;
		y2+=translate_y;

		if(x1>max_x)
			max_x=x1;
		if(x1<min_x)
			min_x=x1;
		if(x2>max_x)
                        max_x=x2;
                if(x2<min_x)
                        min_x=x2;
		if(y1>max_y)
                        max_y=y1;
                if(y1<min_y)
                        min_y=y1;
                if(y2>max_y)
                        max_y=y2;
		if(y2<min_y)
                        min_y=y2;
	}	

	if(max_x<=500 && max_y<=500 && min_x>=0 && min_y>=0)
		return 0;

	int penalty=1;

	if(max_x>500)
		penalty+=(max_x-500)/100;
	if(max_y>500)
                penalty+=(max_y-500)/100;
	if(min_x<0)
                penalty+=(min_x*(-1))/100;
	if(min_y<0)
                penalty+=(min_y*(-1))/100;

	return penalty;
}
