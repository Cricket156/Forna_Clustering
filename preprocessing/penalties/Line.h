#include "Vector.h"

#define BACKBONE 0
#define BASEPAIR 0

class Line
{
	Point p1,p2;
	int type;

	public:
		Line();
		Line(double,double,double,double,int);
		Point getP1();
		Point getP2();
		int getType();
		double getX1();
		double getX2();
		double getY1();
		double getY2();
		Vector getVector();
		double getLength();
		bool intersect(Line);
};
