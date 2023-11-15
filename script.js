$(function () {
  let maxZIndex = 0;

  let currentZoom = 1;

  $('#zoomIn').click(function () {
    currentZoom += 0.1;
    $('#box-container').css('transform', 'scale(' + currentZoom + ')');
  });

  $('#zoomOut').click(function () {
    currentZoom = Math.max(0.1, currentZoom - 0.1);
    $('#box-container').css('transform', 'scale(' + currentZoom + ')');
  });

  $('#zoomReset').click(function () {
    currentZoom = 1; // Reset the zoom level to the default
    $('#box-container').css('transform', 'scale(' + currentZoom + ')');
  });

  $('#box-container').on('click', '.resizable-box', function () {
    $('#boxWidth').val($(this).width());
    $('#boxHeight').val($(this).height());
    $('#boxColor').val(rgb2hex($(this).css('background-color')));
    $('#boxGroupId').val($(this).data('group-id'));
    $('#boxLabel').val($(this).find('.box-label').text()); // Input for editing label name
    $('#iconOnlyCheck').prop('checked', $(this).hasClass('icon-only')); // Checkbox for icon only
    $('#boxRemarks').val($(this).data('remarks')); // Input for editing remarks

    var icon = $(this).find('i');
    if (icon.length > 0) {
      $('#boxIcon').val(icon.attr('class').replace('fa ', ''));
    } else {
      $('#boxIcon').val('');
    }

    $('#confirmBox').data('currentBoxId', $(this).attr('id'));
    $('#boxModal').modal('show');
  });

  // Event listener for the delete button in the modal
  $('#deleteBox').click(function () {
    // Get the current box ID that we are editing
    var currentBoxId = $('#confirmBox').data('currentBoxId');

    if (currentBoxId) {
      // Remove the box with the current ID from the DOM
      $('#' + currentBoxId).remove();

      // Hide the modal after deletion
      $('#boxModal').modal('hide');
      // Remove the stored current box ID
      $('#confirmBox').removeData('currentBoxId');
    } else {
      alert('No box is selected for deletion!');
    }
  });

  function randomColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  }

  function createBox(width, height, shapeType, color, groupId, iconClass, iconOnly = false, label = '', columns = 10, remarks = '') {
    const gap = 1; // Gap for aesthetics
    const boxNumber = ++maxZIndex; // Increment zIndex for each new box

    // Use the columns parameter to determine rows and cols
    const rows = Math.floor((boxNumber - 1) / columns);
    const cols = (boxNumber - 1) % columns;

    // Log total number of boxes
    const totalBoxes = $('.resizable-box').length;
    console.log('Total number of boxes:', totalBoxes % columns);

    const lastBox = $('.resizable-box').last();
    let lastTop = lastBox.length ? parseInt(lastBox.css('top'), 10) : 0;
    let lastLeft = lastBox.length ? parseInt(lastBox.css('left'), 10) : 0;

    console.log(lastTop);

    if (totalBoxes > 0 && totalBoxes % columns === 0) {
      lastTop += height + gap;
      lastLeft = 0;
    } else {
      lastLeft += lastBox.length ? width + gap : 0;
    }
    // Calculate positions, considering the width, height, and gap
    const topPosition = lastTop;
    const leftPosition = lastLeft;

    const boxLabel = label || 'Box ' + boxNumber;
    const circleClass = shapeType === 'circle' ? 'circle-shape' : '';

    const box = $('<div/>', {
      id: 'box' + boxNumber,
      class: 'resizable-box ' + circleClass + (iconOnly ? ' icon-only' : ''),
      'data-box_number': boxNumber,
      'data-group-id': groupId,
      'data-shape-type': shapeType,
      'data-remarks': remarks,
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
    }
    else {
      if (iconClass) {
        box.append($('<i/>', { class: 'fa ' + iconClass + ' icon' }));
      }
      box.append($('<span/>', { class: 'box-label', text: boxLabel }));
    }
    //box.data('remarks', remarks);

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

  function toggleDragResize(enable) {
    if (enable) {
      $('.resizable-box').draggable('enable').resizable('enable');
    } else {
      $('.resizable-box').draggable('disable').resizable('disable');
    }
  }

  toggleDragResize($('#editModeCheck').is(':checked'));

  // Event handler for the EditMode checkbox change
  $('#editModeCheck').change(function () {
    var isInEditMode = $(this).is(':checked');
    toggleDragResize(isInEditMode);
  });

  // Event listener for the "Create 100" button
  $('#create100').click(function () {
    const numberOfBoxes = 200;
    const boxWidth = 100; // Default width
    const boxHeight = 100; // Default height
    const shapeType = 'box'; // Default shapeType
    const groupId = 'default-group'; // Default groupId
    const columns = 20; // The dynamic number of columns you want

    for (let i = 0; i < numberOfBoxes; i++) {
      const color = '#fff'; // Generate a random color for each box
      const label = 'Box ' + (maxZIndex + 1); // Label for each box
      createBox(boxWidth, boxHeight, shapeType, color, groupId, '', false, label, columns);
    }
  });

  $('#create').click(function () {
    $('#boxModal').modal('show');
  });

  $('#confirmBox').click(function () {
    var currentBoxId = $(this).data('currentBoxId');
    var width = $('#boxWidth').val();
    var height = $('#boxHeight').val();
    var color = $('#boxColor').val();
    var groupId = $('#boxGroupId').val();
    var iconClass = $('#boxIcon').val();
    var iconOnly = $('#iconOnlyCheck').is(':checked');
    var label = $('#boxLabel').val();
    var remarks = $('#boxRemarks').val(); // Get the remarks from the input field

    if (currentBoxId) {
      var box = $('#' + currentBoxId);
      box.empty(); // Clear any previous content
      box.removeClass('icon-only');
      box.data('remarks', remarks); // Save the remarks to the box's data attributes

      if (iconOnly) {
        box.addClass('icon-only');
        box.append($('<i/>', { class: 'fa ' + iconClass }));
        box.css({
          'background-color': 'transparent',
          'border': 'none'
        }).data('group-id', groupId);
      }
      else {
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
    }
    else {
      // Create a new box
      createBox(parseInt(width), parseInt(height), 'box', color, groupId, iconClass, iconOnly, label, 1, remarks);

    }

    $('#boxModal').modal('hide');
    $('#confirmBox').removeData('currentBoxId');
  });


  $('.createBox').click(function () {
    const width = $(this).data('w');
    const height = $(this).data('h');
    const shapeType = $(this).data('shape-type'); // Use hyphenated data attributes

    createBox(width, height, shapeType, randomColor());
  });


  $('#save').click(function () {
    const boxes = $('.resizable-box').map(function () {
      return {
        top: $(this).css('top'),
        left: $(this).css('left'),
        width: $(this).css('width'),
        height: $(this).css('height'),
        zIndex: parseInt($(this).css('z-index')),
        label: $(this).find('.box-label').text(),
        color: $(this).css('background-color'),
        shapeType: $(this).attr('data-shape-type'), // Use the 'data-shape-type' attribute
        groupId: $(this).data('group-id'), // Use the 'data-group-id' attribute
        remarks: $(this).data('remarks') // Retrieve the 'data-remarks' attribute
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

  // Hover event to show box info only if EditMode is unchecked
  $('#box-container').on('mouseenter', '.resizable-box', function () {
    if (!$('#editModeCheck').is(':checked')) {
      var label = $(this).find('.box-label').text();
      var remarks = $(this).data('remarks') || 'No remarks';

      // Set the content of the modal
      $('#boxInfoLabel').text(label);
      $('#boxRemarksContent').text(remarks);

      // Show the modal
      $('#boxInfo').modal('show');
    }
  });

  // Mouse leave event to hide box info only if EditMode is unchecked
  $('#box-container').on('mouseleave', '.resizable-box', function () {
    if (!$('#editModeCheck').is(':checked')) {
      // Hide the modal when the mouse leaves the box
      $('#boxInfo').modal('hide');
    }
  });

  // Right-click event on a box
  $('#box-container').on('contextmenu', '.resizable-box', function(e) {
    e.preventDefault(); // Prevent the default context menu

    // Set the position of the custom context menu
    $('#boxContextMenu').css({
        top: e.pageY + 'px',
        left: e.pageX + 'px',
        display: 'block'
    });

    // Store the ID of the clicked box
    $('#boxContextMenu').data('targetBoxId', $(this).attr('id'));
});

// Click event on the Edit option in the context menu
$('#editBox').click(function() {
    var targetBoxId = $('#boxContextMenu').data('targetBoxId');
    if (targetBoxId) {
        // Trigger the click event on the target box to open the edit modal
        $('#' + targetBoxId).trigger('click');
    }
    $('#boxContextMenu').hide(); // Hide the context menu
});

// Hide context menu when clicking elsewhere
$(document).click(function() {
    $('#boxContextMenu').hide();
});

  //loadBoxesFromJson(myjson);

});