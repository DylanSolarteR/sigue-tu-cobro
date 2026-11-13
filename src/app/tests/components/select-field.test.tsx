// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import SelectField from '@/components/dashboard/SelectField';

afterEach(cleanup);
const options = [{ value: '1', label: 'Ángela' }, { value: '2', label: 'Bruno' }, { value: '3', label: 'Carla' }];
it('filtra sin distinguir tildes y permite seleccionar con teclado y devolver el foco', () => {
  const change = vi.fn();
  render(<SelectField id="client" value="" onChange={change} options={options} placeholder="Selecciona" searchable searchLabel="Buscar cliente" />);
  const trigger = screen.getByRole('combobox');
  fireEvent.click(trigger);
  const search = screen.getByRole('searchbox', { name: 'Buscar cliente' });
  expect(document.activeElement).toBe(search);
  fireEvent.change(search, { target: { value: 'angela' } });
  expect(screen.queryByRole('option', { name: 'Bruno' })).toBeNull();
  fireEvent.keyDown(search, { key: 'Enter' });
  expect(change).toHaveBeenCalledWith('1');
  expect(document.activeElement).toBe(trigger);
  expect(trigger.getAttribute('aria-expanded')).toBe('false');
});
it('navega opciones, cancela con Escape y cierra al salir', () => {
  const change = vi.fn();
  render(<><SelectField id="status" value="1" onChange={change} options={options} /><button>Fuera</button></>);
  const trigger = screen.getByRole('combobox');
  fireEvent.keyDown(trigger, { key: 'ArrowDown' });
  fireEvent.keyDown(trigger, { key: 'ArrowDown' });
  fireEvent.keyDown(trigger, { key: 'Enter' });
  expect(change).toHaveBeenCalledWith('2');
  fireEvent.click(trigger);
  fireEvent.keyDown(trigger, { key: 'Escape' });
  expect(trigger.getAttribute('aria-expanded')).toBe('false');
  fireEvent.click(trigger);
  fireEvent.pointerDown(screen.getByRole('button', { name: 'Fuera' }));
  expect(trigger.getAttribute('aria-expanded')).toBe('false');
});
it('presenta resultados vacíos, deshabilitación y datos de formulario', () => {
  const { rerender } = render(<form><SelectField id="doc" name="doc" value="2" onChange={vi.fn()} options={options} searchable searchLabel="Buscar" /></form>);
  expect(new FormData(screen.getByRole('combobox').closest('form')!).get('doc')).toBe('2');
  fireEvent.click(screen.getByRole('combobox'));
  fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'inexistente' } });
  expect(screen.getByText('Sin resultados')).toBeTruthy();
  rerender(<SelectField id="doc" value="" onChange={vi.fn()} options={options} disabled />);
  expect(screen.getByRole<HTMLButtonElement>('combobox').disabled).toBe(true);
});

it('exige una selección y enfoca el control al validar el formulario', () => {
  render(<form><SelectField id="required" name="doc" required options={options} /><button type="submit">Enviar</button></form>);
  const form = screen.getByRole('combobox').closest('form')!;
  act(() => { expect(form.checkValidity()).toBe(false); });
  expect(document.activeElement).toBe(screen.getByRole('combobox'));
  expect(screen.getByRole('alert')).toBeTruthy();
  fireEvent.click(screen.getByRole('combobox'));
  fireEvent.click(screen.getByRole('option', { name: 'Bruno' }));
  expect(form.checkValidity()).toBe(true);
  expect(new FormData(form).get('doc')).toBe('2');
});
