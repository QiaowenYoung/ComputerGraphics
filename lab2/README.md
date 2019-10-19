Notes
===============
* How to use multiple shaders
In lab1, I eventually gave up trying WebGL to draw red circles and blue rects at the same time due to this problem. 
This time, I found a [nice tutorial](https://blog.csdn.net/wangcuiling_123/article/details/85090612 "悬停显示") 
on how to switch between two programs. Meanwhile, doing the initialization work in individual functions will make it more 
convenient when some changes to the shaders need to be made.<br>
* Flat shading & Smooth shading
I will just need to decide the normals for each point in different algorithms to change between these two shading methods. 
For flat shading, all the points for a polygon have identical normal, which is the normal for the polygon. 
But for smooth shading, the point's normal is decidede by the polygons that surround it, 
namely the average of surrounding polygons' normals.
