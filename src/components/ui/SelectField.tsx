// src/components/ui/SelectField.tsx
import {
  Children,
  Fragment,
  isValidElement,
  useId,
  type ChangeEvent,
  type ReactNode,
  type SelectHTMLAttributes,
} from 'react'
import { Dropdown, type DropdownOption } from './Dropdown'

interface SelectFieldProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string
  error?: string
}

/** Reads <option> children (including ones wrapped in fragments/arrays) into dropdown options. */
function collectOptions(children: ReactNode, into: DropdownOption[] = []): DropdownOption[] {
  Children.forEach(children, (child) => {
    if (!isValidElement(child)) return
    const props = child.props as {
      value?: string | number
      disabled?: boolean
      children?: ReactNode
    }
    if (child.type === Fragment) {
      collectOptions(props.children, into)
      return
    }
    if (child.type === 'option') {
      const label = Children.toArray(props.children).join('')
      into.push({
        value: String(props.value ?? label),
        label,
        disabled: props.disabled,
      })
    }
  })
  return into
}

/**
 * Form select with the site's own dropdown list (see Dropdown). The call-site API is unchanged:
 * pass <option> children and read `event.target.value` in onChange.
 */
export function SelectField({
  label,
  id: externalId,
  className,
  error,
  children,
  value,
  onChange,
  name,
  disabled,
}: SelectFieldProps) {
  const generatedId = useId()
  const errorId = useId()
  const id = externalId ?? generatedId
  const options = collectOptions(children)
  const placeholder = options.find((option) => option.value === '' && option.disabled)?.label

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="font-serif text-sm font-medium text-primary-text">
        {label}
      </label>
      <Dropdown
        id={id}
        name={name}
        options={options}
        value={value === undefined || value === null ? '' : String(value)}
        placeholder={placeholder}
        disabled={disabled}
        invalid={Boolean(error)}
        ariaDescribedBy={error ? errorId : undefined}
        triggerClassName={className}
        onChange={(next) =>
          onChange?.({
            target: { value: next, name: name ?? '' },
            currentTarget: { value: next, name: name ?? '' },
          } as unknown as ChangeEvent<HTMLSelectElement>)
        }
      />
      {error && (
        <p id={errorId} className="text-xs text-support-error" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}
