document.onkeydown = function(e) {
  switch (e.which) {
    case 37: // left

      break;

    case 38: // up
      doRotateLoop();
      break;

    case 39: // right

      break;

    case 40: // down

      break;

    default:
      return; // exit this handler for other keys
  }
  e.preventDefault(); // prevent the default action (scroll / move caret)
};
const directionEnum = {
  UP: 'up',
  Down: 'down',
}
const shiftAmount = 1;
const elements = document.querySelectorAll(".fold .inner");
const elementBase = elements[0].getBoundingClientRect();
const foldWrapperElem = document.querySelector("#foldWrapper");
const $foldWrapper = $(foldWrapperElem);
const elementHeight = 75;
const wrapperStartY = foldWrapper.getBoundingClientRect().y;
let minRot = 0;
let maxRot = 90;
let nextRot = 45;
let currentState = directionEnum.Down;
let stepArray = [];
let steps = (elements.length / 2);
for (let i = 0; i < steps; i++) {
  stepArray.push({
    'totalRotation': 0,
    'totalRotationAbs': 0,
    set rot(rot) {
      $(elements[this.topElem.ID]).css(createTransformCss(rot, this.topElem.origin));
      $(elements[this.topElem.ID]).parent().css('height', elements[this.topElem.ID].getBoundingClientRect().height);
      $(elements[this.botElem.ID]).css(createTransformCss(Math.abs(rot), this.botElem.origin));
      $(elements[this.botElem.ID]).parent().css('height', elements[this.botElem.ID].getBoundingClientRect().height);
      this.botElem.top();
      this.topElem.rotation = rot;
      this.botElem.rotation = rot;
      this.totalRotation = rot;
      this.totalRotationAbs = Math.abs(rot);
    },
    'topElem': {
      'rotation': 0,
      'origin': 'top',
      'ID': elements.length - (2 * i) - 2,

    },

    'botElem': {
      'rotation': 0,
      'origin': 'bottom',
      'ID': elements.length - (2 * i) - 1,
      'topValue': 0,

      top() {
        this.topValue = elements[this.ID].getBoundingClientRect().height - elementBase.height;
        $(elements[this.ID]).css('top', this.topValue + "px");

      },
    }
  });
}
doRotateLoop(5);
let currentArrayIndex = 0;


let active = true;

function doRotateLoop(speed = shiftAmount) {
  let interval = setInterval(function() {
    if (currentState == directionEnum.Down) {
      if (currentArrayIndex < stepArray.length) {
        rotate(directionEnum.UP, speed);
      } else {
        clearInterval(interval);
        currentState = directionEnum.UP;
        currentArrayIndex--;
      }
    } else {
      if (currentArrayIndex >= 0) {
        rotate(directionEnum.Down, speed);
      } else {
        clearInterval(interval);
        currentState = directionEnum.Down;
        currentArrayIndex++;
      }
    }
  }, 10);
}

function rotate(direction, amount = shiftAmount) {
  if (direction == directionEnum.UP) {
    if (stepArray[currentArrayIndex].totalRotationAbs < maxRot) {
      setRot(currentArrayIndex, direction, amount);
    } else {
      currentArrayIndex++;
    }
  } else {
    if (stepArray[currentArrayIndex].totalRotationAbs > minRot) {
      setRot(currentArrayIndex, direction, amount);
    } else {
      currentArrayIndex--;
    }
  }
}

function setRot(arrayIndex, direction, amount = shiftAmount) {
  if (direction == directionEnum.UP) {
    let newRot = stepArray[arrayIndex].totalRotation - amount;
    if (newRot < -90) {
      newRot = -90;
    }
    stepArray[arrayIndex].rot = newRot;
    if (stepArray[arrayIndex].totalRotationAbs > nextRot && (arrayIndex + 1) < stepArray.length) {
      setRot(arrayIndex + 1, direction, amount);
    }
  } else {
    let newRot = stepArray[arrayIndex].totalRotation + amount;
    if (newRot > 0) {
      newRot = 0;
    }
    stepArray[arrayIndex].rot = newRot;
    if (stepArray[arrayIndex].totalRotationAbs < nextRot && (arrayIndex - 1) >= 0) {
      setRot(arrayIndex - 1, direction, amount);
    }
  }


}


function createTransformCss(rotationDeg, transformOrigin, height = false, perspective = 200) {
  var shadow = 0;
  shadow = 140 - (Math.abs(rotationDeg) * 2);

  var boxShadow = 'rgba(0, 0, 0, 0.75) 0px 0px 151px -' + shadow + 'px inset';
  if (transformOrigin == "bottom") {
    shadow = 370 - (Math.abs(rotationDeg) * 3);
    boxShadow = 'rgba(0, 0, 0, 0.75) 0px 200px 151px -' + shadow + 'px inset';
  }

  if (Math.abs(rotationDeg) == 0) {
    boxShadow = "none";
  }

  return {
    'transform-origin': transformOrigin,
    'transform': 'perspective(' + perspective + 'px) rotateX(' + (rotationDeg) + 'deg)',
    'box-shadow': boxShadow
  }
}

const offset = 300;
let lastScrollTop = 0;
$(window).scroll(function() {
  let st = $(window).scrollTop();
  let yValue = foldWrapper.getBoundingClientRect().y;
  let bottomValue = foldWrapper.getBoundingClientRect().bottom;

  if (st > lastScrollTop) {
    if (offset >= yValue) {
      while ($foldWrapper.height() < (offset - yValue) && $foldWrapper.height() < elements.length * elementHeight) {
        rotate(directionEnum.Down, 1)
      }
      // if ($foldWrapper.height() < elements.length * elementHeight) {
      //     rotate(directionEnum.Down, st - lastScrollTop);
      // }
    }

  } else {
    // while ($foldWrapper.height() > st && $foldWrapper.height() > 0) {
    //     rotate(directionEnum.Up, 1)
    // }
    if (offset <= bottomValue) {

      if ($foldWrapper.height() > 0) {
        rotate(directionEnum.UP, lastScrollTop - st);
      }
    }
  }

  lastScrollTop = st;
});
