import * as vscode from 'vscode'

const getSelectedLineCount = (selections: readonly vscode.Selection[]) => {
    const ranges = selections
        .filter(selection => !selection.isEmpty)
        .map(selection => {
            const start = selection.start.line
            let end = selection.end.line

            if (selection.end.character === 0 && end > start) {
                end--
            }

            return { start, end }
        })
        .filter(range => range.end >= range.start)
        .sort((a, b) => a.start - b.start || a.end - b.end)

    if (ranges.length === 0) {
        return 0
    }

    let total = 0
    let currentStart = ranges[0].start
    let currentEnd = ranges[0].end

    for (let index = 1; index < ranges.length; index++) {
        const range = ranges[index]

        if (range.start <= currentEnd + 1) {
            currentEnd = Math.max(currentEnd, range.end)
            continue
        }

        total += currentEnd - currentStart + 1
        currentStart = range.start
        currentEnd = range.end
    }

    return total + currentEnd - currentStart + 1
}

export const activate = (context: vscode.ExtensionContext) => {
    const statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 10000)
    statusBarItem.name = 'Selected Lines Counter'
    statusBarItem.tooltip = 'Number of selected lines'

    const updateStatusBar = () => {
        const editor = vscode.window.activeTextEditor

        if (!editor) {
            statusBarItem.hide()
            return
        }

        const lineCount = getSelectedLineCount(editor.selections)

        if (lineCount === 0) {
            statusBarItem.hide()
            return
        }

        statusBarItem.text = `$(list-selection) ${lineCount} ${lineCount === 1 ? 'line' : 'lines'}`
        statusBarItem.show()
    }

    context.subscriptions.push(
        statusBarItem,
        vscode.window.onDidChangeTextEditorSelection(updateStatusBar),
        vscode.window.onDidChangeActiveTextEditor(updateStatusBar)
    )

    updateStatusBar()
}

export const deactivate = () => {}
