const DIRECTION = {
  UP: 'up',
  Down: 'down',
}

// TODO: globals for debugging
const shiftAmount = 1;
let stepArray = [];
let minRot = 0;
let maxRot = 90;
let nextRot = 45;
let currentState = DIRECTION.Down;
let currentArrayIndex = 0;

function rotate(direction, amount = shiftAmount) {
  if (direction == DIRECTION.UP) {
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

function doRotateLoop(speed = shiftAmount) {
  let interval = setInterval(function() {
    console.log('?')
    if (currentState == DIRECTION.Down) {
      if (currentArrayIndex < stepArray.length) {
        rotate(DIRECTION.UP, speed);
      } else {
        clearInterval(interval);
        currentState = DIRECTION.UP;
        currentArrayIndex--;
      }
    } else {
      if (currentArrayIndex >= 0) {
        rotate(DIRECTION.Down, speed);
      } else {
        clearInterval(interval);
        currentState = DIRECTION.Down;
        currentArrayIndex++;
      }
    }
  }, 10);
}

function setRot(arrayIndex, direction, amount = shiftAmount) {
  if (direction == DIRECTION.UP) {
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

$( document ).ready(function() {
  const elements = document.querySelectorAll(".fold .inner");
  const elementBase = elements[0].getBoundingClientRect();
  const foldWrapperElem = document.querySelector("#fold-wrapper");
  const foldWrapper = $(foldWrapperElem);
  const elementHeight = elementBase.height;
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
  doRotateLoop(1);


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
    let yValue = foldWrapperElem.getBoundingClientRect().y;
    let bottomValue = foldWrapperElem.getBoundingClientRect().bottom;

    if (st > lastScrollTop) {
      if (offset >= yValue) {
        while (foldWrapper.height() < (offset - yValue) && foldWrapper.height() < elements.length * elementHeight) {
          rotate(DIRECTION.Down, 1)
        }
        // if ($foldWrapper.height() < elements.length * elementHeight) {
        //     rotate(DIRECTION.Down, st - lastScrollTop);
        // }
      }

    } else {
      // while ($foldWrapper.height() > st && $foldWrapper.height() > 0) {
      //     rotate(DIRECTION.Up, 1)
      // }
      if (offset <= bottomValue) {

        if (foldWrapper.height() > 0) {
          rotate(DIRECTION.UP, lastScrollTop - st);
        }
      }
    }

    lastScrollTop = st;
  });
});