import {fromModule} from '@alinea/ui'
import {HTMLAttributes} from 'react'
import css from './Logo.module.scss'

const styles = fromModule(css)

export function Logo(props: HTMLAttributes<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 35 10"
      style={{fill: 'currentcolor'}}
      {...props}
      className={styles.root.mergeProps(props)()}
    >
      <path d="M5.016 3V3.564C4.62 3.108 4.032 2.832 3.228 2.832C1.656 2.832 0.360001 4.212 0.360001 6C0.360001 7.788 1.656 9.168 3.228 9.168C4.032 9.168 4.62 8.892 5.016 8.436V9H6.816V3H5.016ZM3.588 7.464C2.76 7.464 2.16 6.9 2.16 6C2.16 5.1 2.76 4.536 3.588 4.536C4.416 4.536 5.016 5.1 5.016 6C5.016 6.9 4.416 7.464 3.588 7.464Z" />
      <path d="M8.13656 9H9.93656V0.239998H8.13656V9Z" />
      <path d="M12.1538 2.472C12.7418 2.472 13.2338 1.98 13.2338 1.392C13.2338 0.803998 12.7418 0.311998 12.1538 0.311998C11.5658 0.311998 11.0738 0.803998 11.0738 1.392C11.0738 1.98 11.5658 2.472 12.1538 2.472ZM11.2538 9H13.0538V3H11.2538V9Z" />
      <path d="M17.8869 2.832C17.0949 2.832 16.4949 3.12 16.1709 3.564V3H14.3709V9H16.1709V5.724C16.1709 4.872 16.6269 4.488 17.2869 4.488C17.8629 4.488 18.3309 4.836 18.3309 5.58V9H20.1309V5.316C20.1309 3.696 19.0989 2.832 17.8869 2.832Z" />
      <path d="M22.975 6.72H27.235C27.283 6.492 27.307 6.252 27.307 6C27.307 4.188 26.011 2.832 24.259 2.832C22.363 2.832 21.067 4.212 21.067 6C21.067 7.788 22.339 9.168 24.391 9.168C25.531 9.168 26.419 8.748 27.007 7.932L25.567 7.104C25.327 7.368 24.907 7.56 24.415 7.56C23.755 7.56 23.203 7.344 22.975 6.72ZM22.939 5.376C23.107 4.764 23.563 4.428 24.247 4.428C24.787 4.428 25.327 4.68 25.519 5.376H22.939Z" />
      <path d="M32.6254 3V3.564C32.2294 3.108 31.6414 2.832 30.8374 2.832C29.2654 2.832 27.9694 4.212 27.9694 6C27.9694 7.788 29.2654 9.168 30.8374 9.168C31.6414 9.168 32.2294 8.892 32.6254 8.436V9H34.4254V3H32.6254ZM31.1974 7.464C30.3694 7.464 29.7694 6.9 29.7694 6C29.7694 5.1 30.3694 4.536 31.1974 4.536C32.0254 4.536 32.6254 5.1 32.6254 6C32.6254 6.9 32.0254 7.464 31.1974 7.464Z" />
    </svg>
  )
}
