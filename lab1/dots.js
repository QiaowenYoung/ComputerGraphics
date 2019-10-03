let canvas = document.querySelector('canvas');
canvas.width = 600;
canvas.height = 600;
let c = canvas.getContext('2d');
let dotArrayx = []; // Record the x-coordinate of the dot
let dotArrayy = []; // Record the y-coordinate of the dot
let isLeft = []; // Record whether it's a left click
let imageData = []; // Maintain a stack of imageDatas

// Prevent the default setting for left/right click in the window
canvas.oncontextmenu = function(e){
    e.preventDefault();
};

// Draw a red circle at (x, y)
function DrawCircle(x, y){
    c.beginPath();
    c.arc(x,y,10,0,360,false);
    c.fillStyle = 'rgba(255, 0, 0, 1)';
    c.fill();
    c.closePath();
}

// Draw a blue rect at (x, y)
function DrawRect(x, y){
    c.fillStyle = 'rgba(0, 0, 255, 1)';
    // Make the coordinate (x-5, y-5) so that the rectangle's center is at (x, y)
    c.fillRect(x-5, y-5, 10, 10);
}

// Decide whether there is a sequence of points drawn at the same coordinate
function isOver(x, y){
    let l;
    l = dotArrayx.length;
    if(l === 0)
        return false;
    if(dotArrayx[l-1] === x && dotArrayy[l-1] === y)
        return true;
    return false;
}

// Listen to the mousedown event
canvas.onmousedown = function(e) {
    let x = e.offsetX;
    let y = e.offsetY;
    let l = dotArrayx.length;

    // If it is a right click
    if(e.button === 2){
        console.log('right click');
        // If the blue rectangle is located right on the previous red circle
        if(isOver(x, y) && isLeft[l-1]+0 === 1){
            // If there is only one point now, just clear the canvas
            if(dotArrayx.length === 1){
                c.clearRect(0, 0, canvas.width, canvas.height);
            }
            // Retrive the penultimate imageData to hide the last red circle
            else{
                let k = imageData.length - 2;
                k = (k >= 0) ? k : 0;
                c.putImageData(imageData[k], 0, 0);
            }
        }
        /* If there are a sequence of blue rectangles at the same coordinate,
         * only push the imageData once. */
        if(isOver(x, y) && isLeft[l-1]+0 != 1){
            DrawRect(x, y);
            dotArrayx.push(x);
            dotArrayy.push(y);
            isLeft.push(0);
        }
        else{
            DrawRect(x, y);
            dotArrayx.push(x);
            dotArrayy.push(y);
            isLeft.push(0);
            imageData.push(c.getImageData(0, 0, canvas.width, canvas.height));
        }
    }

    // If it is a left click
    else if(e.button === 0){
        console.log('left click');
        // If the red circle is located right on the previous blue rectangle
        if(isOver(x, y) && isLeft[l-1]+1 === 1){
            // If there is only one point now, just clear the canvas
            if(dotArrayx.length === 1){
                c.clearRect(0, 0, canvas.width, canvas.height);
            }
            // Retrive the penultimate imageData to hide the last blue rectangle
            else{
                let k = imageData.length - 2;
                k = (k >= 0) ? k : 0;
                c.putImageData(imageData[k], 0, 0);
            }
        }
        /* If there are a sequence of red circles at the same coordinate,
         * only push the imageData once. */
        if(isOver(x, y) && isLeft[l-1]+1 != 1){
            DrawCircle(x, y);
            dotArrayx.push(x);
            dotArrayy.push(y);
            isLeft.push(1);
        }
        else{
            DrawCircle(x, y);
            dotArrayx.push(x);
            dotArrayy.push(y);
            isLeft.push(1);
            imageData.push(c.getImageData(0, 0, canvas.width, canvas.height));
        }
    }

    // If the left and right clicks are detected at the same position
    else if(e.button === 3){
        console.log('left and right click');
        /* By draw the circle first,
         * it can be seen that both circle and rectangle are drawn here. */
        DrawCircle(x, y);
        DrawRect(x, y);
        dotArrayx.push(x);
        dotArrayy.push(y);
        isLeft.push(2);
        imageData.push(c.getImageData(0, 0, canvas.width, canvas.height));
    }
}