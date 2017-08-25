module Jekyll
  module YesNoFilter
    def yesno(input)
      if input
        "yes"
      else
        "no"
      end
    end
  end
end

Liquid::Template.register_filter(Jekyll::YesNoFilter)
