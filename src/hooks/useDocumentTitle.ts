import { useEffect } from 'react'

const SUFFIX = 'استودنت‌ورک'

export function useDocumentTitle(title?: string) {
  useEffect(() => {
    document.title = title ? `${title} | ${SUFFIX}` : `${SUFFIX} | پلتفرم کارهای دانشجویی`
  }, [title])
}
