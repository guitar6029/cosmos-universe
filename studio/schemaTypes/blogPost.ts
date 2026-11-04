Failed to create stream fd: Operation not permitted
Failed to create stream fd: Operation not permitted
Failed to create stream fd: Operation not permitted
import { defineArrayMember, defineField, defineType } from "sanity";

const categories = [
  { title: "Engineering Logs", value: "engineering" },
  { title: "Debugging Dispatches", value: "debugging" },
  { title: "Universe Updates", value: "updates" },
  { title: "Universe Lore", value: "lore" },
];

export const blogPost = defineType({
  name: "blogPost",
  title: "Blog Post",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: {
        source: "title",
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "excerpt",
      title: "Excerpt",
      type: "text",
      rows: 4,
      validation: (Rule) => Rule.required().max(300),
    }),
    defineField({
      name: "coverImage",
      title: "Cover image",
      type: "image",
      options: {
        hotspot: true,
      },
    }),
    defineField({
      name: "category",
      title: "Category",
      type: "string",
      options: {
        list: categories,
        layout: "radio",
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "author",
      title: "Author",
      type: "reference",
      to: [{ type: "author" }],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "publishedAt",
      title: "Published at",
      type: "datetime",
    }),
    defineField({
      name: "body",
      title: "Body",
      type: "array",
      of: [
        defineArrayMember({
          type: "block",
          styles: [
            { title: "Normal", value: "normal" },
            { title: "Heading 2", value: "h2" },
            { title: "Heading 3", value: "h3" },
          ],
          lists: [
            { title: "Bullet", value: "bullet" },
            { title: "Numbered", value: "number" },
          ],
          marks: {
            decorators: [
              { title: "Bold", value: "strong" },
              { title: "Italic", value: "em" },
            ],
            annotations: [
              {
                name: "link",
                title: "Link",
                type: "object",
                fields: [
                  defineField({
                    name: "href",
                    title: "URL",
                    type: "url",
                    validation: (Rule) => Rule.required().uri({ allowRelative: true }),
                  }),
                ],
              },
            ],
          },
        }),
        defineArrayMember({
          name: "image",
          title: "Inline image",
          type: "image",
          options: {
            hotspot: true,
          },
          fields: [
            defineField({
              name: "alt",
              title: "Alt text",
              type: "string",
              validation: (Rule) => Rule.required().max(180),
            }),
          ],
        }),
        defineArrayMember({
          name: "code",
          title: "Code block",
          type: "object",
          fields: [
            defineField({
              name: "code",
              title: "Code",
              type: "text",
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: "language",
              title: "Language",
              type: "string",
              description: "Language identifier for future syntax highlighting.",
              initialValue: "plaintext",
              validation: (Rule) => Rule.required(),
            }),
          ],
          preview: {
            select: {
              code: "code",
              language: "language",
            },
            prepare({ code, language }) {
              return {
                title: language || "Code block",
                subtitle: code || "Empty code block",
              };
            },
          },
        }),
      ],
      validation: (Rule) => Rule.required().min(1),
    }),
  ],
  preview: {
    select: {
      title: "title",
      subtitle: "category",
      media: "coverImage",
    },
  },
});
