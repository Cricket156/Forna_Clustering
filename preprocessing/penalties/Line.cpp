#include "Line.h"
#include <iostream>

using namespace std;

Line::Line()
{
	this->p1=Point();
	this->p2=Point();
	this->type=BASEPAIR;
}

Line::Line(double x1,double y1,double x2,double y2, int type)
{
	this->p1=Point(x1,y1);
	this->p2=Point(x2,y2);
	this->type=type;
}

Point Line::getP1()
{
	return p1;
}

Point Line::getP2()
{
        return p2;
}

int Line::getType()
{
	return type;
}

double Line::getX1()
{
	return p1.getX();
}

double Line::getY1()
{
	return p1.getY();
}

double Line::getX2()
{
	return p2.getX();
}

double Line::getY2()
{
	return p2.getY();
}

Vector Line::getVector()
{
	Vector v = Vector(getX2()-getX1(),getY2()-getY1());
	v.normalize();

	return v;
}

double Line::getLength()
{
	Vector v = Vector(getX2()-getX1(),getY2()-getY1());
	return v.norm();
}

bool Line::intersect(Line line)
{
	//n mal d im nenner
	Vector n=line.getVector().getNormal();
	Vector d=getVector();
	Point N=line.getP1();
	Point P=getP1();

	double nenner = n*d;

	if(nenner < 0.000001 && nenner > -0.000001)
		return false;

	double lambda = (n*N+n*(-1)*P)/nenner;

	double length = getLength();

	if(!(lambda > 0.001 && lambda < length-0.001))
		return false;
	
	n=getVector().getNormal();
        d=line.getVector();
        N=getP1();
        P=line.getP1();

        nenner = n*d;

        if(nenner < 0.000001 && nenner > -0.000001)
                return false;

        lambda = (n*N+n*(-1)*P)/nenner;

        length = line.getLength();

	if(lambda > 0.001 && lambda < length-0.001)
                return true;

	return false;
}
