import { Group, Text, useMantineTheme } from '@mantine/core'

function FilePathInput() {
  const theme = useMantineTheme()

  const handleFiles = (event) => {
    const files = event.target.files
    Array.from(files).forEach((file) => {
      console.log(file)
      console.log(file.webkitRelativePath || file.name) // 'webkitRelativePath' gives the relative path
    })
  }

  return (
    <Group position="center" direction="column" style={{ padding: 20 }}>
      <Text size="sm" style={{ marginBottom: 5 }}>
        Upload folder
      </Text>
      <label
        style={{
          display: 'inline-block',
          padding: '7px 15px',
          fontSize: '14px',
          color: theme.colors.gray[7],
          backgroundColor: theme.colors.blue[6],
          borderRadius: theme.radius.sm,
          cursor: 'pointer'
        }}
      >
        Select Folder
        <input
          type="file"
          webkitdirectory=""
          directory=""
          multiple
          style={{ display: 'none' }}
          onChange={handleFiles}
        />
      </label>
    </Group>
  )
}

export default FilePathInput
