// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.

const { dialog } = require('electron').remote;
const remote = require('electron').remote;
const fs = remote.require('fs');
const prompt = require('electron-prompt');
const win = require('electron').remote.getCurrentWindow();

const qualificationButtons = document.querySelectorAll('#Officials g, #Style_Judges g');
const inputs = document.querySelectorAll('#Input, [data-name="Input"]');
const photoButton = document.querySelector('#Photo');
const saveButton = document.querySelector('#save');

qualificationButtons.forEach((element) => {
	element.addEventListener('click', (event) => {
		let inactiveNode = event.currentTarget.querySelector('[data-name="Inactive"]') || 
			event.currentTarget.querySelector('#Inactive');

		inactiveNode.style.display === 'none' ? inactiveNode.style.display = '' : inactiveNode.style.display = 'none';
	});
});

inputs.forEach((element) => {
	element.addEventListener('click', (event) => {
		let node = event.currentTarget;
		prompt({
			title: node.parentElement.querySelector('text:not([data-name="Input"]').innerHTML,
			value: node.getAttribute('data-value') || node.parentElement.id,
		})
		.then((result) => {
			if(result !== null) {
				node.setAttribute('data-value', result);
				node.innerHTML = result;

				if (node.parentElement.id === 'Special_Rank') {
					let container = node.parentElement.querySelector('#Bottom');
					let containerWidth = container.getBBox().width;

					let nodeWidth = node.getBBox().width;

					node.transform.baseVal[0].matrix.e = (containerWidth / 2) - (nodeWidth / 2);
				}
			}
		})
	});
});

photoButton.addEventListener('click', () => {
	dialog.showOpenDialog(
		{
			filters: [
				{
					name: 'Images',
					extensions: ['png', 'jpg', 'jpeg']
				}
			]
		}, 
		function(filepaths) {
			if (!filepaths) {
				return false;
			}

			let img = filepaths[0];
			let target = document.querySelector('#Photo_frame');
			let photoText = document.querySelector('#Photo text');
			let targetBBox = target.getBBox();

			photoText.style.display = 'none';

			let imageNode = document.querySelector('#Photo image');

			if (imageNode) {
				imageNode.setAttribute('xlink:href', img);
			}
			else {
				let out = `<image xlink:href="${img}" width="${targetBBox.width}" x="${targetBBox.x}" y="${targetBBox.y}" />`;
				target.insertAdjacentHTML('beforeend', out);
			}

			return;
	});
});

saveButton.addEventListener('click', (event) => {
	dialog.showSaveDialog(
		{
			filters: [
				{
					name: 'PDF',
					extensions: 'pdf'
				}
			]
		},
		function(fileName) {
			if (fileName.split('.').length === 1) {
				fileName += '.pdf';
			}

			win.webContents.printToPDF({
				marginsType: 1,
				pageSize: {
					height: 148000,
					width: 105000,
				}
			}, (error, data) => {
				if (error) throw error
				fs.writeFile(fileName, data, (error) => {
				  if (error) throw error
				  console.log('PDF escrito con éxito.')
				  dialog.showMessageBox({
					message: 'PDF Saved Succesfully!'
				  });
				})
			  })
		}
	);

});
