module Jekyll
  module YesNoFilter
    def yesno(input)
      if input and input.length == 1
        if input.downcase.strip == 'y' or input.to_i > 0
          "Yes"
        else
          "No"
        end
      else
        input
      end
    end
  end
end

Liquid::Template.register_filter(Jekyll::YesNoFilter)
