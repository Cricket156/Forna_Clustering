#include "Penalties.h"
#include <iostream>
#include <vector>
#include <string.h>

using namespace std;
using namespace pugi;

int main(int argc, const char* argv[])
{
	const char* xml_file;
	vector<Line> lines;
	
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

	return 0;
}
