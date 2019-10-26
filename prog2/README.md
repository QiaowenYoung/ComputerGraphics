Notes
=====
How to draw a whole tree
-------------------------
Just transform one cylinder from (0, 0) to where it should be, and scale it properly. 
The difficulty is the speed for calculation. When it is for one tree, the delay in loading a webpage is hard to feel. 
But for multiple trees, it costs too much time to draw a tree. 
There are several ways to solve this. The easiest is to store the tree's coordinates into an array, which is the way I use. 
In this way, when a click is detected, the program will only need to extract data from that array and plus the (x, y) coordinates 
to it. Another way is to use GPU for calculation, which means transferring a transform matrix to shaders programs. It's the 
more sophisticated method, but I haven't tried this way.
