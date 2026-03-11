import LinkText, { type LinkTextProps } from "./LinkText"

const ListLink = ({ children, to, target, ...rest }: LinkTextProps) => {
  return (
    <li {...rest}>
      <LinkText to={to} target={target}>
        {children}
      </LinkText>
    </li>
  )
}
export default ListLink
