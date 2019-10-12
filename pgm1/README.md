Debugging & Thoughts
====================
* Canvas is blank<br>
This is caused by the inappropriate use of gl.drawArray(). At first, I kept creating new trees and stored their coordinates in one array.
Although idk why it shall cause canvas to blank out, still it's not an efficient way to generate trees. Since every tree is of the same type, 
I will just need to create one tree at (0, 0), and translate it to (Tx, Ty). This can be done easily through setting gl_Position = a_Position + u_Translation.
* Trees are strange<br>
I got stuck in the algorithm for a long time. I used to include ways of parsing a string, which describes the fractal rule used for generating, 
to define how to grow a tree. Later I found it not necessary. I then referrd to preorder traversal, using recursions to handle it. 
The real difficulty comes from linear algebra. I spent too much time on how to precisely and cleverly use rotational angles to avoid a 
rotation matrix. I failed a lot, although at that time I always thought I was near the truth. Ultimately, I had to deal with it by multiplying the vector with a 
matrix to place the next point on its right position.
* About WebGL<br>
I got some experience from lab1, that a buffer must and can only be bound to one source of data at a single time. Only after these data are passed and done over, 
can gl.bufferData() be used for another array of data.<br>
Pgm1 shows that WebGL may not be a fancy and difficult API. The most tricky bugs still come from algorithm.
