First a word of caution: Please leave folder structure unchanged.
If you update any javascript code please paste it at the appropriate place.
I have changed the structure of index.html such that the the files get sourced correctly, hence
if you change anything in index.html please do so in this version of the file.

This implementation works with a lot of dependencies:

Installation of:
scikitlearn
flask
pandas
matplotlib

is necessary.

I'd recommend you download Anaconda or any other distribution, that would include most of the dependencies.
Some of which you will still have to install seperately. However this is often easy using pip install <modulename>
or conda install <modulename>.

The flask dependency is the only one that works a bit different.
You should follow the directions of this blog post.
http://blog.miguelgrinberg.com/post/the-flask-mega-tutorial-part-i-hello-world

Once this is done you should be able to run it.
I am not sure, if you have to re do it, however please make app.py in
the appintegrated folder an executable (chmod a+x app.py in ubuntu).
The go to your terminal, navigate to the folder app integrated and run it using ./app.py.

This should show the following on your terminal:
* Running on http://127.0.0.1:5000/ (Press CTRL+C to quit)
* Restarting with stat
* Debugger is active!
* Debugger pin code: 203-437-849

Now access the page using this address in your browser.
http://localhost:5000/userinterface.html

You will see the userinterface which makes it possible to upload the penalties
file. The dropdown menus facilitate you choosing the parameters for clustering.
Save will start the clustering (you should see the parameter array in your terminal),
and ultimately redirect you to the visualization index.html page,
where you can upload the results.csv from the clustering.
