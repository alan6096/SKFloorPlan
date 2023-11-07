$(function () {
  let maxZIndex = 0;

  let currentZoom = 1;

    $('#zoomIn').click(function() {
        currentZoom += 0.1;
        $('#box-container').css('transform', 'scale(' + currentZoom + ')');
    });

    $('#zoomOut').click(function() {
        currentZoom = Math.max(0.1, currentZoom - 0.1);
        $('#box-container').css('transform', 'scale(' + currentZoom + ')');
    });
    
  $('#box-container').on('click', '.resizable-box', function () {
    $('#boxWidth').val($(this).width());
    $('#boxHeight').val($(this).height());
    $('#boxColor').val(rgb2hex($(this).css('background-color')));
    $('#boxGroupId').val($(this).data('group-id'));
    $('#boxLabel').val($(this).find('.box-label').text()); // Input for editing label name
    $('#iconOnlyCheck').prop('checked', $(this).hasClass('icon-only')); // Checkbox for icon only

    var icon = $(this).find('i');
    if (icon.length > 0) {
      $('#boxIcon').val(icon.attr('class').replace('fa ', ''));
    } else {
      $('#boxIcon').val('');
    }

    $('#confirmBox').data('currentBoxId', $(this).attr('id'));
    $('#boxModal').modal('show');
  });

  function randomColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  }

  function createBox(width, height, shapeType, color, groupId, iconClass, iconOnly = false, label = '') {
    const gap = 1; // Assuming a gap for aesthetics
    const boxNumber = ++maxZIndex; // Increment the zIndex for each new box
    const rows = Math.floor((boxNumber - 1) / 5);
    const cols = (boxNumber - 1) % 5;
  
    const topPosition = rows * (height + gap);
    const leftPosition = cols * (width + gap);
  
    const boxLabel = label || 'Box ' + boxNumber;
    const circleClass = shapeType === 'circle' ? 'circle-shape' : '';
  
    const box = $('<div/>', {
      id: 'box' + boxNumber,
      class: 'resizable-box ' + circleClass + (iconOnly ? ' icon-only' : ''),
      'data-box_number': boxNumber,
      'data-group-id': groupId,
      'data-shape-type': shapeType,
      css: {
        position: 'absolute',
        top: topPosition + 'px',
        left: leftPosition + 'px',
        width: width + 'px',
        height: height + 'px',
        backgroundColor: color,
        zIndex: boxNumber
      }
    });
  
    if (iconOnly && iconClass) {
      box.append($('<i/>', { class: 'fa ' + iconClass }));
      box.css({
        'background-color': 'transparent',
        'border': 'none'
      });
    } else {
      if (iconClass) {
        box.append($('<i/>', { class: 'fa ' + iconClass + ' icon' }));
      }
      box.append($('<span/>', { class: 'box-label', text: boxLabel }));
    }
  
    box.appendTo('#box-container').draggable({ containment: "#container" }).resizable({
      // Optional: If you want to maintain aspect ratio while resizing, uncomment below
      // aspectRatio: true,
      // Optional: If you want to set the containment within the parent, uncomment below
      // containment: "parent"
    });
  
    return box;
  }
  

  function rgb2hex(rgb) {
    if (/^#[0-9A-F]{6}$/i.test(rgb)) return rgb;

    rgb = rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
    function hex(x) {
      return ("0" + parseInt(x).toString(16)).slice(-2);
    }
    return "#" + hex(rgb[1]) + hex(rgb[2]) + hex(rgb[3]);
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

  $('#confirmBox').click(function() {
    var currentBoxId = $(this).data('currentBoxId');
    var width = $('#boxWidth').val();
    var height = $('#boxHeight').val();
    var color = $('#boxColor').val();
    var groupId = $('#boxGroupId').val();
    var iconClass = $('#boxIcon').val();
    var iconOnly = $('#iconOnlyCheck').is(':checked');
    var label = $('#boxLabel').val();

    if (currentBoxId) {
      var box = $('#' + currentBoxId);
      box.empty(); // Clear any previous content
      box.removeClass('icon-only');
      if (iconOnly) {
        box.addClass('icon-only');
        box.append($('<i/>', { class: 'fa ' + iconClass }));
        box.css({
          'background-color': 'transparent',
          'border': 'none'
        }).data('group-id', groupId);
      } else {
        if (iconClass) {
          box.prepend($('<i/>', { class: 'fa ' + iconClass }));
        }
        box.append($('<span/>', { class: 'box-label', text: label }));
        box.css({
          'background-color': color,
          'border': '' // Reset to default border if needed
        }).data('group-id', groupId);
      }
      box.css({
        'width': width + 'px',
        'height': height + 'px'
      });
    } else {
      // Create a new box
      createBox(parseInt(width), parseInt(height), 'box', color, groupId, iconClass, iconOnly, label);
    }

    $('#boxModal').modal('hide');
    $('#confirmBox').removeData('currentBoxId');
  });


  $('.createBox').click(function () {
    const width = $(this).data('w');
    const height = $(this).data('h');
    const shapeType = $(this).data('shape-type'); // Use hyphenated data attributes

    createBox(width, height, shapeType,randomColor());
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

  $('#clear').click(function () {
    $('#box-container').empty(); // Clears all boxes from the container
    maxZIndex = 0; // Reset the zIndex counter if you're using one
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

  //loadBoxesFromJson(myjson);

});