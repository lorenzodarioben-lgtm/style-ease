package views

import "github.com/lorenzodarioben-lgtm/style-ease/internal/domain"

func studioSelected(m Model, id int) bool {
	for _, l := range m.ActiveLook.Lines {
		if l.Variant.ID == id {
			return true
		}
	}
	return false
}

func unavailable(lines []domain.Line) bool {
	for _, l := range lines {
		if !l.Variant.Active || l.Product.Stock < l.Quantity {
			return true
		}
	}
	return false
}
