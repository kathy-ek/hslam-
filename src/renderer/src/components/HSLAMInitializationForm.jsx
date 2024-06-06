import React, { useRef } from 'react'
import { useFormik } from 'formik'
import {
  TextInput,
  Checkbox,
  Button,
  Select,
  FileInput,
  Container,
  Group,
  Title,
  Grid
} from '@mantine/core'

const HSLAMForm = () => {
  const calibFileRef = useRef(null)
  const gammaFileRef = useRef(null)
  const vignetteFileRef = useRef(null)

  const formik = useFormik({
    initialValues: {
      dataType: 'camera',
      calibFile: null,
      datasetPath: null,
      gammaFile: null,
      vignetteFile: null,
      photometric: true,
      executionRealtime: true,
      loopClosure: true,
      fileLogging: false,
      viewerGUI: true,
      sequenceReversed: false
    },
    onSubmit: async (values) => {
      const result = await window.electron.ipcRenderer.invoke('hslam-initialization', values)
      if (result) {
        alert(result)
      }
    }
  })

  const handleFolderSelection = async (fieldName) => {
    const result = await window.electron.ipcRenderer.invoke('open-folder-dialog')
    if (result) {
      formik.setFieldValue(fieldName, result)
    }
  }

  return (
    <Container size="sm" style={{ marginTop: '40px' }}>
      <Title order={1}>Launch HSLAM</Title>

      <Grid className="form-grid-wrapper">
        <Grid.Col span={6}>
          <Select
            label="Data Type"
            placeholder="Select Data Type"
            data={[
              { value: 'camera', label: 'Live Camera Feed' },
              { value: 'dataset', label: 'Dataset' }
            ]}
            onChange={(value) => formik.setFieldValue('dataType', value)}
            value={formik.values.dataType}
          />
        </Grid.Col>
        <Grid.Col span={6}>
          <TextInput
            label="Path of Camera Calibration File"
            placeholder="Select Camera Calibration File"
            value={formik.values.calibFile}
            onClick={() => {
              calibFileRef.current.click()
            }}
          />
          <input
            type="file"
            ref={calibFileRef}
            onChange={(e) => {
              formik.setFieldValue('calibFile', e?.target?.files[0].path)
            }}
            style={{ display: 'none' }}
          />
        </Grid.Col>
        {formik.values.dataType === 'dataset' && (
          <>
            <Grid.Col span={6}>
              <TextInput
                label="Dataset Path"
                placeholder="Select Dataset Folder"
                onClick={() => {
                  handleFolderSelection('datasetPath')
                }}
                value={formik.values.datasetPath}
              />
            </Grid.Col>
            <Grid.Col span={3}>
              <Checkbox label="Execute Realtime" {...formik.getFieldProps('executionRealtime')} />
            </Grid.Col>
            <Grid.Col span={3}>
              <Checkbox label="Reverse Sequence" {...formik.getFieldProps('sequenceReversed')} />
            </Grid.Col>
          </>
        )}

        <Grid.Col span={12}>
          <Checkbox
            label="Enable Photometric Bundle Adjustment"
            checked={formik.values.photometric}
            {...formik.getFieldProps('photometric')}
          />
        </Grid.Col>
        {formik.values.photometric && (
          <>
            <Grid.Col span={6}>
              <TextInput
                label="Path of Gamma File"
                placeholder="Select Gamma File"
                value={formik.values.gammaFile}
                onClick={() => {
                  gammaFileRef.current.click()
                }}
              />
              <input
                type="file"
                ref={gammaFileRef}
                onChange={(e) => {
                  formik.setFieldValue('gammaFile', e?.target?.files[0].path)
                }}
                style={{ display: 'none' }}
              />
            </Grid.Col>
            <Grid.Col span={6}>
              <TextInput
                label="Vignette File Path"
                placeholder="Select Vignette File"
                value={formik.values.vignetteFile}
                onClick={() => {
                  vignetteFileRef.current.click()
                }}
              />
              <input
                type="file"
                ref={vignetteFileRef}
                onChange={(e) => {
                  formik.setFieldValue('vignetteFile', e?.target?.files[0].path)
                }}
                style={{ display: 'none' }}
              />
            </Grid.Col>
          </>
        )}

        <Grid.Col span={4}>
          <Checkbox
            label="Enable Loop Closure"
            checked={formik.values.loopClosure}
            {...formik.getFieldProps('loopClosure')}
          />
        </Grid.Col>
        <Grid.Col span={4}>
          <Checkbox
            label="Enable File Logging"
            checked={formik.values.fileLogging}
            {...formik.getFieldProps('fileLogging')}
          />
        </Grid.Col>
        <Grid.Col span={4}>
          <Checkbox
            label="Enable Viewer GUI"
            checked={formik.values.viewerGUI}
            {...formik.getFieldProps('viewerGUI')}
          />
        </Grid.Col>
      </Grid>
      <Button color="blue" onClick={formik.handleSubmit}>
        Submit
      </Button>
    </Container>
  )
}

export default HSLAMForm
