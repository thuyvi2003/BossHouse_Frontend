import { Editor } from '@tinymce/tinymce-react';
import { useRef } from 'react';

export default function RichTextEditor({ value = '', onChange, placeholder = 'Enter content...' }) {
  const editorRef = useRef(null);

  return (
    <Editor
    apiKey="4etezslxg5mywek98o906k1xt4jfuvzdpebtq6iqo3bsbwz2" // thay bằng API key TinyMCE của bạn
      onInit={(evt, editor) => editorRef.current = editor}
      value={value}
      onEditorChange={onChange}
      init={{
        height: 300,
        menubar: true,
        plugins: [
          'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
          'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
          'insertdatetime', 'media', 'table', 'code', 'help', 'wordcount'
        ],
        toolbar: 'undo redo | blocks | ' +
          'bold italic underline | alignleft aligncenter ' +
          'alignright alignjustify | bullist numlist outdent indent | ' +
          'link image | removeformat | help',
        content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }',
        placeholder: placeholder,
        branding: false,
        promotion: false,
        resize: false,
        statusbar: false,
        menubar: 'file edit view insert format table tools help',
        menu: {
          file: { title: 'File', items: 'newdocument restoredraft | preview | print ' },
          edit: { title: 'Edit', items: 'undo redo | cut copy paste pastetext | selectall | searchreplace' },
          view: { title: 'View', items: 'code | visualaid visualchars visualblocks | spellchecker | preview fullscreen' },
          insert: { title: 'Insert', items: 'image link media template codesample inserttable | charmap emoticons hr | pagebreak nonbreaking anchor toc | insertdatetime' },
          format: { title: 'Format', items: 'bold italic underline strikethrough superscript subscript codeformat | blocks fontfamily fontsize align lineheight | forecolor backcolor | removeformat' },
          table: { title: 'Table', items: 'inserttable | cell row column | tableprops deletetable' },
          tools: { title: 'Tools', items: 'spellchecker spellcheckerlanguage | code wordcount' },
          help: { title: 'Help', items: 'help' }
        }
      }}
    />
  );
}
