#include <cmath>
#include "Point.h"

class Vector
{
	double x,y;

	public:	
		Vector();
		Vector(double,double);
		double getX();
		double getY();
		void setX(double);
		void setY(double);
		double norm();
		void normalize();
		Vector operator+(Vector);
		Vector operator*(double);
		double operator*(Vector);
		double operator*(Point);
		Vector getNormal();
};
