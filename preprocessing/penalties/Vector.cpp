#include "Vector.h"

Vector::Vector()
{
        this->x=0;
        this->y=0;
}

Vector::Vector(double x,double y)
{
	this->x=x;
	this->y=y;
}

double Vector::getX()
{
	return x;
}

double Vector::getY()
{
        return y;
}

void Vector::setX(double x)
{
        this->x=x;
}

void Vector::setY(double y)
{
        this->y=y;
}

double Vector::norm()
{
	return sqrt(x*x+y*y);
}

void Vector::normalize()
{
	
	double n=this->norm();

	if (n)
	{
		this->setX(this->x/n);
		this->setY(this->y/n);
	}
}

Vector Vector::operator+(Vector v)
{
	Vector result;
	result.setX(this->x+v.x);
	result.setY(this->y+v.y);

	return result;
}

Vector Vector::operator*(double s)
{
	return Vector(x*s,y*s);
}

double Vector::operator*(Vector v)
{
	return this->x*v.x + this->y*v.y;
}

double Vector::operator*(Point p)
{
        return this->x*p.getX() + this->y*p.getY();
}

Vector Vector::getNormal()
{
	return Vector((-1)*getY(),getX());
}


