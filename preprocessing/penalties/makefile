CXX ?= g++
CC ?= gcc
CFLAGS   := $(CFLAGS) -Wall
CXXFLAGS := $(CXXFLAGS) -Wall
LDFLAGS := $(BLAS)

.PHONY: all clean run

all: penalties

run: penalties
	./penalties bild.png

runtest: test
	./test

penalties: Line.o Point.o Vector.o Penalties.o lib/pugixml.o
	$(CXX) -o penalties $^ $(LDFLAGS)

test: Line.o Point.o Vector.o test.o lib/pugixml.o
	$(CXX) -o test $^ $(LDFLAGS)

.cpp.o:
	$(CXX) $(CXXFLAGS) -c -o $@ $<

clean:
	-@rm -f *.o penalties test
