import * as vscode from 'vscode';
import * as io from 'socket.io-client';

const socket = io('http://localhost:58825');

export function activate(context: vscode.ExtensionContext) {
	console.log('Congratulations, your extension "how-fast-you-are" is now active!');

	const disposable = vscode.workspace.onDidChangeTextDocument((event) => {
		socket.emit('key', event.contentChanges[0].text);
	});

	context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() {}
