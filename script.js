$(function () {
  let maxZIndex = 0;

  function randomColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  }

  function createBox(width, height, shapeType = 'box') {
    const gap = 0; // No gap as per your previous request
    const boxNumber = maxZIndex + 1;
    const rows = Math.floor((boxNumber - 1) / 5);
    const cols = (boxNumber - 1) % 5;

    const topPosition = rows * height;
    const leftPosition = cols * width;

    const boxLabel = 'Row' + (rows + 1) + '-Col' + (cols + 1);
    const circleClass = shapeType === 'circle' ? 'circle-shape' : '';

    const box = $('<div id="box' + boxNumber + '" class="resizable-box ' + circleClass + '" shapetype="' + shapeType + '" data-box_number="' + boxNumber + '" style="background-color: ' + randomColor() + '; position: absolute; top: ' + topPosition + 'px; left: ' + leftPosition + 'px; width: ' + width + 'px; height: ' + height + 'px; z-index: ' + boxNumber + ';">' + boxLabel + '</div>');

    box.appendTo('#box-container').draggable({ containment: "#container" }).resizable();
    maxZIndex = boxNumber;
  }



  function loadBoxesFromJson(data) {
    $('#box-container').empty();
    data.boxes.forEach(box => {
      // Remove 'px' if it's already included in the JSON data
      const topPosition = box.top.includes('px') ? box.top : box.top + 'px';
      const leftPosition = box.left.includes('px') ? box.left : box.left + 'px';
      const width = box.width.includes('px') ? box.width : box.width + 'px';
      const height = box.height.includes('px') ? box.height : box.height + 'px';

      // Update the zIndex to a number if it is not already
      const zIndex = Number(box.zIndex);

      // Correct the attribute to shape-type
      $('<div id="box' + zIndex + '" class="resizable-box" shape-type="' + box.shapeType + '" style="background-color: ' + box.color + '; position: absolute; top: ' + topPosition + '; left: ' + leftPosition + '; width: ' + width + '; height: ' + height + '; z-index: ' + zIndex + ';">' + box.label + '</div>')
        .appendTo('#box-container')
        .draggable({ containment: "#container" })
        .resizable();

      // Update maxZIndex if necessary
      if (maxZIndex < zIndex) {
        maxZIndex = zIndex;
      }
    });
  }




  $('#create').click(function () {
    $('#boxModal').modal('show');
  });

  $('#confirmBox').click(function () {
    const width = parseInt($('#boxWidth').val());
    const height = parseInt($('#boxHeight').val());
    createBox(width, height);
    $('#boxModal').modal('hide');
  });

  $('.createBox').click(function () {
    const width = $(this).data('w');
    const height = $(this).data('h');
    const shapeType = $(this).data('shape-type'); // Use hyphenated data attributes

    createBox(width, height, shapeType);
  });


  $('#save').click(function () {
    const boxes = $('.resizable-box').map(function () {
      return {
        top: $(this).css('top'),
        left: $(this).css('left'),
        width: $(this).css('width'),
        height: $(this).css('height'),
        zIndex: parseInt($(this).css('z-index')),
        label: $(this).text(),
        color: $(this).css('background-color'),
        shapeType: $(this).attr('shape-type') // Use the hyphenated attribute here as well
      };
    }).get();

    const jsonOutput = {
      boxes: boxes
    };

    $('#json-output').text(JSON.stringify(jsonOutput, null, 2));
  });





  $('#load').on('click', function () {
    $('#fileInput').click();
  });

  $('#fileInput').on('change', function (e) {
    const file = e.target.files[0];

    if (!file) {
      return;
    }

    const reader = new FileReader();

    reader.onload = function (event) {
      const jsonData = JSON.parse(event.target.result);
      loadBoxesFromJson(jsonData);
    };

    reader.onerror = function (event) {
      console.error("File could not be read! Code " + event.target.error.code);
    };

    reader.readAsText(file);
  });
  let myjson = {
    "boxes": [
      {
        "top": "0px",
        "left": "0px",
        "width": "100px",
        "height": "100px",
        "zIndex": 1,
        "label": "Row1-Col1",
        "color": "rgb(70, 180, 97)"
      },
      {
        "top": "0px",
        "left": "100px",
        "width": "100px",
        "height": "100px",
        "zIndex": 2,
        "label": "Row1-Col2",
        "color": "rgb(183, 22, 95)"
      },
      {
        "top": "0px",
        "left": "200px",
        "width": "100px",
        "height": "100px",
        "zIndex": 3,
        "label": "Row1-Col3",
        "color": "rgb(58, 125, 57)"
      },
      {
        "top": "0px",
        "left": "300px",
        "width": "100px",
        "height": "100px",
        "zIndex": 4,
        "label": "Row1-Col4",
        "color": "rgb(204, 241, 142)"
      },
      {
        "top": "0px",
        "left": "400px",
        "width": "100px",
        "height": "100px",
        "zIndex": 5,
        "label": "Row1-Col5",
        "color": "rgb(70, 46, 167)"
      },
      {
        "top": "100px",
        "left": "0px",
        "width": "100px",
        "height": "100px",
        "zIndex": 6,
        "label": "Row2-Col1",
        "color": "rgb(84, 60, 14)"
      },
      {
        "top": "100px",
        "left": "100px",
        "width": "100px",
        "height": "100px",
        "zIndex": 7,
        "label": "Row2-Col2",
        "color": "rgb(243, 76, 190)"
      },
      {
        "top": "28.8px",
        "left": "18.8px",
        "width": "50px",
        "height": "50px",
        "zIndex": 8,
        "label": "Row2-Col3",
        "color": "rgb(228, 208, 18)"
      },
      {
        "top": "50px",
        "left": "150px",
        "width": "50px",
        "height": "50px",
        "zIndex": 9,
        "label": "Row2-Col4",
        "color": "rgb(53, 233, 80)"
      },
      {
        "top": "0.800003px",
        "left": "316.8px",
        "width": "50px",
        "height": "100px",
        "zIndex": 10,
        "label": "Row2-Col5",
        "color": "rgb(169, 191, 70)"
      }
    ]
  };

  loadBoxesFromJson(myjson);

});